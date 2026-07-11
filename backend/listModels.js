import dotenv from "dotenv";
dotenv.config();

const getModels = async () => {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
  const data = await res.json();
  console.log(data.models.map(m => m.name).join("\n"));
};

getModels();
