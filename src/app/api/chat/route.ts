import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // Simulate network and processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple mocked logic for demonstration
    const lowerText = lastMessage?.content?.toLowerCase() || "";
    let reply = "I'm your Handy Experts AI assistant. I can help you find services, understand our pricing, or assist with booking. How can I help?";

    if (lowerText.includes("clean") || lowerText.includes("maid")) {
      reply = "We offer professional Deep Cleaning, Standard Cleaning, and Move-in/Move-out cleaning services. You can book them starting from just $49! Check out our Services page for more details.";
    } else if (lowerText.includes("plumb") || lowerText.includes("leak") || lowerText.includes("pipe")) {
      reply = "Our certified plumbers can help with leak repairs, pipe installations, and general maintenance. We have a standard call-out fee of $30. Shall I redirect you to our Booking page?";
    } else if (lowerText.includes("price") || lowerText.includes("cost") || lowerText.includes("how much")) {
      reply = "Our pricing is transparent and upfront! It varies depending on the service. For example, AC servicing starts at $29, while deep cleaning starts at $89. You can view detailed packages under each service.";
    } else if (lowerText.includes("book") || lowerText.includes("schedule")) {
      reply = "You can book a service easily by clicking the 'Book Now' button in the navigation, or by selecting a specific service package and adding it to your cart.";
    } else if (lowerText.includes("hello") || lowerText.includes("hi")) {
      reply = "Hello! 👋 Welcome to Handy Experts. What kind of home service are you looking for today?";
    } else if (lowerText.includes("thank")) {
      reply = "You're very welcome! Let me know if you need anything else.";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "I'm having a little trouble right now, please try again." }, { status: 500 });
  }
}
