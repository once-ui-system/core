const fs = require("fs");
const path = require("path");
const https = require("https");

const categories = {
  smileys: ["face", "emotion", "person", "smile", "laugh", "sad", "angry", "love", "heart"],
  animals: ["animal", "creature", "pet", "bug", "insect", "bird", "fish", "reptile", "mammal"],
  food: ["food", "drink", "fruit", "vegetable", "meal", "breakfast", "lunch", "dinner"],
  activities: ["sport", "game", "hobby", "activity", "exercise", "play"],
  travel: [
    "travel",
    "place",
    "building",
    "location",
    "transport",
    "vehicle",
    "car",
    "plane",
    "ship",
  ],
  objects: ["object", "tool", "device", "book", "money", "office", "clothing"],
  symbols: ["symbol", "sign", "arrow", "shape", "math", "punctuation", "currency", "religion"],
  flags: ["flag", "country", "nation"],
};

function fetchEmojiData() {
  return new Promise((resolve, reject) => {
    https
      .get("https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json", (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const emojiData = JSON.parse(data);
            resolve(emojiData);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function categorizeEmoji(emoji) {
  let bestCategory = "objects";
  let bestScore = 0;

  const textToCheck = [emoji.description || "", ...(emoji.aliases || []), ...(emoji.tags || [])]
    .join(" ")
    .toLowerCase();

  for (const [category, keywords] of Object.entries(categories)) {
    const score = keywords.reduce((count, keyword) => {
      return count + (textToCheck.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

async function generateEmojiData() {
  try {
    console.log("Fetching emoji data...");
    const rawEmojiData = await fetchEmojiData();

    const categorizedEmojis = {};

    Object.keys(categories).forEach((category) => {
      categorizedEmojis[category] = [];
    });

    // Helper function to check if a string contains valid emoji characters
    function isValidEmoji(str) {
      // Check if the string exists and isn't just whitespace
      if (!str || str.trim() === "") return false;

      // Check for replacement characters or known broken sequences
      if (str.includes("�")) return false;

      // Simple length check - emoji shouldn't be too long
      if (str.length > 10) return false;

      return true;
    }

    rawEmojiData.forEach((emoji) => {
      if (emoji.emoji && isValidEmoji(emoji.emoji)) {
        const category = categorizeEmoji(emoji);
        categorizedEmojis[category].push({
          char: emoji.emoji,
          description: emoji.description || "",
          aliases: emoji.aliases || [],
          tags: emoji.tags || [],
        });
      }
    });

    const outputPath = path.join(__dirname, "../src/data/emoji-data.json");

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(categorizedEmojis, null, 2), { encoding: "utf8" });

    console.log(`Emoji data generated successfully at ${outputPath}`);
    console.log(`Total emojis: ${rawEmojiData.length}`);
    Object.keys(categorizedEmojis).forEach((category) => {
      console.log(`${category}: ${categorizedEmojis[category].length} emojis`);
    });
  } catch (error) {
    console.error("Error generating emoji data:", error);
    process.exit(1);
  }
}

generateEmojiData();
