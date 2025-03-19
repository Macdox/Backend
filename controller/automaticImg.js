import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API,
});

const api = async (params) => {
  const imageResponse = await openai.images.generate({
    prompt: "A futuristic cityscape at sunset",
    n: 1,
    size: "1024x1024",
  });

  console.log(imageResponse.data[0].url);
};
export default api;