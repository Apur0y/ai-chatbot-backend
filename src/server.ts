import express, { Request, Response } from 'express';
import Groq from 'groq-sdk';

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

const groq = new Groq({ apiKey: "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"});
 
// Define a route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.post("/chat",async(req:Request,res:Response)=>{
    console.log("Chat is hited")
    const data = await req.body;
    console.log(data, "data ios here")
    const messages2: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "user",
        content: data.data
      }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages2,
      model: "llama3-8b-8192",
    })
    .then((chatCompletion) => {
      console.log(chatCompletion.choices[0]?.message?.content || "");
    });

    console.log("Responce is here",completion);
    res.json(completion)
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
