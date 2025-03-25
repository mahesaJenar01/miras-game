/**
 * Central color palette for the game
 * All colors should be defined here for consistency
 */
const ColorPalette = {
    // Sky colors
    sky: {
      top: "#C9D9FB",     // Light blue
      middle: "#E3D1F4",   // Soft lavender
      bottom: "#F8E1EC"    // Light pink
    },
    
    // Ground colors
    ground: {
      grass: ["#A9DE9F", "#B9E4AA", "#C9EBB5"],
      dirt: ["#D9BFA9", "#E3CAB1", "#F0DDCA"]
    },
    
    // Sun colors
    sun: {
      main: "#FFD166",     // Warm yellow
      glow: "rgba(255, 209, 102, 0.3)"  // Transparent yellow
    },
    
    // Cloud color
    cloud: "rgba(255, 255, 255, 0.8)",
    
    // Character colors
    stickfigure: {
      main: "#FF69B4",     // Hot pink for a girly look
      outline: "#FF69B4"
    },
    
    // Attacker colors
    attacker: {
      main: "#3A86FF",     // Strong blue for a heroic look
      sword: "#FF10F0",    // Bright pink/magenta for a flashy sword
      glow: "rgba(58, 134, 255, 0.3)",  // Semi-transparent blue
      shield: {
        back: "#2C5282",   // Darker blue for shield back
        front: "#63B3ED",  // Lighter blue for shield front
        border: "#1A365D"  // Very dark blue border
      },
      cape: {
        top: "#3A86FF",    // Match the hero color at the top
        bottom: "#1D43FF"  // Darker blue at the bottom
      }
    },
    
    // Flower colors
    flowers: ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA", "#F7C8E0"],
    
    // Button colors
    buttons: {
      move: {
        primary: "#B5EAD7",
        hover: "#9EDAC4"
      },
      jump: {
        primary: "#C7CEEA",
        hover: "#B1BAE4"
      },
      attack: {
        primary: "#FFDAC1",
        hover: "#FFCBAA"
      },
      text: "#333333"
    }
  };
  
  export default ColorPalette;