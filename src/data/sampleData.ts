import { Person, MessageRequest, Chat } from "@/types";

export const samplePeople: Person[] = [
  {
    id: "1", name: "Thiri", initials: "TH", color: "#C9744A",
    distanceLabel: "~1.2 km away",
    bio: "Product designer. Into film photography and night markets.",
    tags: ["Design", "Photography"],
    links: [
      { platform: "instagram", handle: "@thiri.k", hidden: false },
      { platform: "telegram", handle: "@thirik", hidden: false },
    ],
  },
  {
    id: "2", name: "Kaung", initials: "KG", color: "#6E8B5E",
    distanceLabel: "~2.5 km away",
    bio: "Backend engineer, weekend futsal. Always down for coffee chats.",
    tags: ["Engineering", "Football"],
    links: [
      { platform: "x", handle: "@kaungdev", hidden: false },
      { platform: "instagram", handle: "@kaung.codes", hidden: false },
    ],
  },
  {
    id: "3", name: "Su Su", initials: "SS", color: "#B0653E",
    distanceLabel: "Less than 1 km away",
    bio: "Illustrator and part-time tour guide around Yangon.",
    tags: ["Art", "Travel"],
    links: [
      { platform: "instagram", handle: "@susu.draws", hidden: false },
      { platform: "tiktok", handle: "@susutravels", hidden: false },
    ],
  },
];

export const sampleRequests: MessageRequest[] = [
  {
    id: "r1", name: "Nandar", initials: "ND", color: "#A5744F",
    preview: "Hey! Saw we're both into esports, would love to connect.",
    time: "2h",
  },
];

export const sampleChats: Chat[] = [
  {
    id: "2", name: "Kaung", initials: "KG", color: "#6E8B5E", unread: false,
    messages: [
      { id: "m1", from: "them", text: "Hey, good match at the futsal thing last week" },
      { id: "m2", from: "me", text: "Haha yeah that was fun, we should run it back" },
    ],
  },
];
