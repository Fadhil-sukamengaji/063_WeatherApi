require("dotenv").config();

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

function cariContext(context = [], ...tipe) {
  for (const t of tipe) {
    const item = context.find((c) => c.id && c.id.startsWith(`${t}.`));
    if (item) return item.text;
  }
  return null;
}

app.get("/api/lokasi", async (req, res) => {
  const kota = req.query.kota || "Bandung City";
  const apiKey = process.env.MAPTILER_API_KEY;
  const baseUrl = process.env.MAPTILER_BASE_URL;

  const url = `${baseUrl}/${encodeURIComponent(kota)}.json`;

  try {
    const response = await axios.get(url, { params: { key: apiKey } });
    const feature = response.data.features?.[0];

    if (!feature) {
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });
    }

    const context = feature.context || [];
    const [longitude, latitude] = feature.geometry.coordinates;

    res.json({
      kota: feature.matching_text || feature.text,
      negara: cariContext(context, "country"),
      provinsi: cariContext(context, "region"),
      kecamatan: cariContext(context, "municipal_district", "locality", "county"),
      longitude,
      latitude,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Gagal mengambil data dari MapTiler" });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});