import React from "react";
import { SPRINT_VALUES } from "../engine/sprint.ts";

export interface CardMetadata {
  number: number;
  name: string;
  deck: "START" | "A" | "B" | "C" | "FINISH";
  flavor: string;
  sprint: number;
}

export const CARD_LOCATIONS: Record<number, { name: string; deck: "START" | "A" | "B" | "C" | "FINISH"; flavor: string }> = {
  0: { name: "County Jail", deck: "START", flavor: "Cut fence behind the generator yard." },
  1: { name: "Dusty Alley", deck: "A", flavor: "Shadows between the brick warehouses." },
  2: { name: "Scrap Yard", deck: "A", flavor: "Crushed sedans and barking hounds." },
  3: { name: "Freight Depot", deck: "A", flavor: "Creaking boxcars waiting on track 4." },
  4: { name: "Canal Bridge", deck: "A", flavor: "Damp concrete under the morning mist." },
  5: { name: "Old Water Tower", deck: "A", flavor: "Rusted ladder, panoramic valley view." },
  6: { name: "Railroad Crossing", deck: "A", flavor: "Blinking signals in the empty dusk." },
  7: { name: "Abandoned Gas Station", deck: "A", flavor: "Shattered pumps and creaking metal sign." },
  8: { name: "Grain Silo", deck: "A", flavor: "Hollow echo against cold corrugated tin." },
  9: { name: "Route 66 Motel", deck: "A", flavor: "Flickering neon: 'VACANCY - CABINS'." },
  10: { name: "Dry Creek Wash", deck: "A", flavor: "Cracked mud and tire ruts in the sand." },
  11: { name: "Storm Drain", deck: "A", flavor: "Dark runoff tunnels beneath the highway." },
  12: { name: "Power Substation", deck: "A", flavor: "High voltage humming in the dry heat." },
  13: { name: "Junkyard Crane", deck: "A", flavor: "Cable pulleys swinging in desert winds." },
  14: { name: "Cactus Gulch", deck: "A", flavor: "Prickly pear maze blocking the search cruisers." },
  15: { name: "Red Rock Canyon", deck: "B", flavor: "Terracotta cliffs rising five hundred feet." },
  16: { name: "Mesa Lookout", deck: "B", flavor: "Dust plumes visible twenty miles south." },
  17: { name: "Ghost Town Saloon", deck: "B", flavor: "Swinging louvered doors and weathered timber." },
  18: { name: "Desert Mile 88", deck: "B", flavor: "Telephone wires stretching to infinity." },
  19: { name: "Radio Tower", deck: "B", flavor: "Red beacon pulse keeping time with heartbeat." },
  20: { name: "Windmill Pump", deck: "B", flavor: "Rhythmic squeak drawing groundwater." },
  21: { name: "Copper Mine Shaft", deck: "B", flavor: "Timber shoring into subterranean chill." },
  22: { name: "Boxcar Siding", deck: "B", flavor: "Gravel bed next to an idling diesel." },
  23: { name: "Sandstone Arch", deck: "B", flavor: "Wind-carved window framed against stars." },
  24: { name: "Coyote Ridge", deck: "B", flavor: "Night hunters watching from the bluffs." },
  25: { name: "Highway Diner", deck: "B", flavor: "Warm pie, black coffee, payphone in the back." },
  26: { name: "Arroyo Crossing", deck: "B", flavor: "Flash flood debris piled like driftwood." },
  27: { name: "Railroad Tunnel", deck: "B", flavor: "Pitch-black bore cutting through Granite Peak." },
  28: { name: "Rattlesnake Flats", deck: "B", flavor: "Salt flats shimmering under the heat haze." },
  29: { name: "Pine Ridge Pass", deck: "C", flavor: "First scent of cedar and thin alpine air." },
  30: { name: "Mountain Switchback", deck: "C", flavor: "Hairpin turns overlooking the search lights." },
  31: { name: "Abandoned Airstrip", deck: "C", flavor: "Cracked tarmac where smugglers landed." },
  32: { name: "Boulder Gorge", deck: "C", flavor: "Chasm carved through millions of years." },
  33: { name: "Forest Lookout", deck: "C", flavor: "Stilt tower perched high above the tree canopy." },
  34: { name: "River Rapids", deck: "C", flavor: "White water cascading over granite boulders." },
  35: { name: "Trestle Bridge", deck: "C", flavor: "Skeleton bridge suspended two hundred feet up." },
  36: { name: "High Desert Plateau", deck: "C", flavor: "Wide open horizon with nowhere to hide." },
  37: { name: "Remote Ranch Barn", deck: "C", flavor: "Loft full of sweet hay and cobwebs." },
  38: { name: "Checkpoint Bypass", deck: "C", flavor: "Dirt fire road slipping past the roadblocks." },
  39: { name: "Eagle Crest Peak", deck: "C", flavor: "Snow flurries swirling around the summit." },
  40: { name: "Night Billboard", deck: "C", flavor: "'SEE 7 STATES' sign towering over the asphalt." },
  41: { name: "Last Ridge Trail", deck: "C", flavor: "One final descent before the border valley." },
  42: { name: "STATE LINE", deck: "FINISH", flavor: "Welcome to Freedom. You made it across." },
};

export function getCardMetadata(cardNumber: number): CardMetadata {
  const loc = CARD_LOCATIONS[cardNumber] || {
    name: `Hideout ${cardNumber}`,
    deck: cardNumber <= 14 ? "A" : cardNumber <= 28 ? "B" : "C",
    flavor: "A desolate spot along the desert route.",
  };
  const sprint = cardNumber === 0 || cardNumber === 42 ? 0 : (SPRINT_VALUES[cardNumber] ?? (cardNumber % 2 === 1 ? 1 : 2));
  return {
    number: cardNumber,
    name: loc.name,
    deck: loc.deck,
    flavor: loc.flavor,
    sprint,
  };
}

/**
 * Mid-century graphic procedural SVG scene generator for cards 0 to 42.
 */
export const CardGraphic: React.FC<{ cardNumber: number; className?: string }> = ({
  cardNumber,
  className = "w-full h-full",
}) => {
  const meta = getCardMetadata(cardNumber);
  const { deck } = meta;

  // Deck color palettes
  const palettes = {
    START: {
      skyTop: "#0B132B",
      skyBottom: "#1C2541",
      accent: "#48CAE4",
      hillBack: "#101D42",
      hillFront: "#0D1322",
      silhouette: "#050811",
      road: "#2A2E3D",
    },
    A: {
      skyTop: "#1B2A41",
      skyBottom: "#C97A44",
      accent: "#E8743B",
      hillBack: "#3B2824",
      hillFront: "#281714",
      silhouette: "#140A09",
      road: "#4A3B32",
    },
    B: {
      skyTop: "#2C1A32",
      skyBottom: "#D95D39",
      accent: "#F18F01",
      hillBack: "#421C2B",
      hillFront: "#2B0F1B",
      silhouette: "#180610",
      road: "#5C312C",
    },
    C: {
      skyTop: "#0E1C36",
      skyBottom: "#455E89",
      accent: "#8EC5FC",
      hillBack: "#1D2D44",
      hillFront: "#111D2E",
      silhouette: "#0A0F1A",
      road: "#2F3E46",
    },
    FINISH: {
      skyTop: "#2B1055",
      skyBottom: "#FF9A3C",
      accent: "#FFD166",
      hillBack: "#4C1C5C",
      hillFront: "#2D0C37",
      silhouette: "#15021D",
      road: "#6B2D5C",
    },
  };

  const pal = palettes[deck];
  const seed = (cardNumber * 9301 + 49297) % 233280;
  const pseudoRand = (offset: number) => {
    const s = (seed + offset * 1337) % 233280;
    return s / 233280;
  };

  // Specific landmarks based on card number
  return (
    <svg
      viewBox="0 0 240 320"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${meta.name} card artwork`}
    >
      <defs>
        <linearGradient id={`sky-${cardNumber}`} x1="0%" y1="0%" x2="0%" y2="1">
          <stop offset="0%" stopColor={pal.skyTop} />
          <stop offset="65%" stopColor={pal.skyBottom} />
          <stop offset="1" stopColor={pal.road} />
        </linearGradient>

        <linearGradient id={`sunGrad-${cardNumber}`} x1="0%" y1="0%" x2="0%" y2="1">
          <stop offset="0%" stopColor={pal.accent} stopOpacity="0.9" />
          <stop offset="1" stopColor={pal.skyBottom} stopOpacity="0.2" />
        </linearGradient>

        <radialGradient id={`spotlight-${cardNumber}`} cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.4" />
          <stop offset="1" stopColor="#FFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky background */}
      <rect width="240" height="320" fill={`url(#sky-${cardNumber})`} />

      {/* Stars in high desert */}
      {(deck === "START" || deck === "B" || deck === "C") && (
        <g fill="#FFF" opacity="0.6">
          <circle cx="25" cy="30" r="1" />
          <circle cx="75" cy="45" r="1.2" />
          <circle cx="130" cy="22" r="0.8" />
          <circle cx="190" cy="38" r="1.4" />
          <circle cx="215" cy="65" r="0.9" />
          <circle cx="45" cy="70" r="1" />
          <circle cx="160" cy="55" r="1" />
        </g>
      )}

      {/* Stylized Sun or Moon */}
      {cardNumber === 0 ? (
        // Prison searchlight beam
        <polygon points="20,10 180,180 80,240" fill={`url(#spotlight-${cardNumber})`} opacity="0.8" />
      ) : cardNumber === 42 ? (
        // Rising Golden Freedom Sun
        <circle cx="120" cy="180" r="70" fill={`url(#sunGrad-${cardNumber})`} />
      ) : (
        <circle
          cx={40 + pseudoRand(1) * 160}
          cy={50 + pseudoRand(2) * 50}
          r={18 + pseudoRand(3) * 14}
          fill={`url(#sunGrad-${cardNumber})`}
        />
      )}

      {/* Distant Mountain Range */}
      <path
        d={`M0 160 
           L${30 + pseudoRand(4) * 20} ${130 + pseudoRand(5) * 20} 
           L${80 + pseudoRand(6) * 30} ${145 + pseudoRand(7) * 15} 
           L${140 + pseudoRand(8) * 30} ${125 + pseudoRand(9) * 25} 
           L${200 + pseudoRand(10) * 25} ${140 + pseudoRand(11) * 20} 
           L240 155 L240 320 L0 320 Z`}
        fill={pal.hillBack}
      />

      {/* Near Hills / Mesa */}
      <path
        d={`M0 190 
           Q${60 + pseudoRand(12) * 40} ${165 + pseudoRand(13) * 20} 120 185 
           T240 180 L240 320 L0 320 Z`}
        fill={pal.hillFront}
      />

      {/* Highway Asphalt ribbon */}
      <polygon
        points={`115,190 125,190 ${190 + pseudoRand(14) * 30},320 ${20 + pseudoRand(15) * 30},320`}
        fill={pal.road}
      />
      {/* Highway dashed center line */}
      <line
        x1="120"
        y1="192"
        x2="110"
        y2="320"
        stroke={pal.accent}
        strokeWidth="2.5"
        strokeDasharray="6 8"
        opacity="0.8"
      />

      {/* Silhouette Landmark features based on card archetype */}
      {cardNumber === 0 && (
        <g stroke={pal.silhouette} strokeWidth="1.5" fill="none">
          {/* Watchtower and razor wire */}
          <rect x="15" y="100" width="30" height="70" fill={pal.silhouette} />
          <polygon points="10,100 30,85 50,100" fill={pal.silhouette} />
          <line x1="45" y1="160" x2="240" y2="160" stroke="#888" strokeDasharray="3 3" />
          <line x1="45" y1="165" x2="240" y2="165" stroke="#888" strokeDasharray="3 3" />
        </g>
      )}

      {cardNumber === 9 && (
        // Motel Neon Sign
        <g fill={pal.silhouette}>
          <rect x="25" y="110" width="60" height="40" rx="3" fill="#E8743B" />
          <rect x="52" y="150" width="6" height="50" fill={pal.silhouette} />
          <text x="55" y="132" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            MOTEL
          </text>
        </g>
      )}

      {cardNumber === 25 && (
        // Highway Diner
        <g fill={pal.silhouette}>
          <polygon points="30,170 110,170 120,185 20,185" fill="#D7263D" />
          <rect x="25" y="185" width="90" height="30" fill={pal.silhouette} />
          <circle cx="70" cy="160" r="14" fill="#FFD166" />
          <text x="70" y="164" fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            DINER
          </text>
        </g>
      )}

      {cardNumber === 42 && (
        // State Line Monument Sign
        <g>
          <rect x="50" y="100" width="140" height="65" rx="5" fill="#C9A227" stroke="#FFF" strokeWidth="2" />
          <rect x="80" y="165" width="8" height="50" fill={pal.silhouette} />
          <rect x="152" y="165" width="8" height="50" fill={pal.silhouette} />
          <text x="120" y="125" fill="#1B2A41" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            WELCOME TO
          </text>
          <text x="120" y="145" fill="#D7263D" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            FREEDOM
          </text>
          <text x="120" y="158" fill="#1B2A41" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            STATE LINE MILE 0
          </text>
        </g>
      )}

      {/* Desert Telegraph Pole and Wires */}
      {cardNumber % 3 === 0 && cardNumber !== 0 && cardNumber !== 42 && (
        <g stroke={pal.silhouette} strokeWidth="2">
          <line x1="200" y1="130" x2="200" y2="240" />
          <line x1="185" y1="145" x2="215" y2="145" />
          <line x1="188" y1="155" x2="212" y2="155" />
          <path d="M0 130 Q100 150 185 145" fill="none" strokeWidth="0.8" opacity="0.6" />
          <path d="M215 145 Q230 147 240 148" fill="none" strokeWidth="0.8" opacity="0.6" />
        </g>
      )}

      {/* Saguaro Cacti / Desert Flora */}
      {(cardNumber % 2 === 1 || deck === "A" || deck === "B") && cardNumber !== 42 && (
        <g fill={pal.silhouette}>
          {/* Main cactus stem */}
          <rect x="25" y="180" width="5" height="35" rx="2" />
          {/* Left arm */}
          <path d="M20 195 L25 195 L25 198 L20 198 L20 188 L23 188 L23 192 L25 192" />
          {/* Right arm */}
          <path d="M30 190 L35 190 L35 182 L32 182 L32 187 L30 187" />
        </g>
      )}

      {/* Foreground ground shadow strip */}
      <rect x="0" y="300" width="240" height="20" fill={pal.silhouette} />
    </svg>
  );
};
