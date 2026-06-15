import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 4,
  autoContrast: true,
  luminanceThreshold: 0.35,
  fontFamily: "'DM Sans', sans-serif",
  headings: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: "700",
  },
  colors: {
    brand: [
      "#f4f8f9",
      "#e8eff2",
      "#dce8ec",
      "#c8d8de",
      "#afc5ce",
      "#9fb8c2",
      "#8aa8b3",
      "#6f8f9b",
      "#55717d",
      "#3d5560",
    ],
    mist: [
      "#fbfcfd",
      "#f3f6f7",
      "#e8edef",
      "#dae3e6",
      "#c9d6db",
      "#b3c4cb",
      "#93a7b0",
      "#738892",
      "#556973",
      "#394951",
    ],
  },
  defaultRadius: "md",
  components: {
    Paper: {
      defaultProps: {
        radius: "xl",
        withBorder: true,
      },
    },
    Card: {
      defaultProps: {
        radius: "xl",
        withBorder: true,
        shadow: "sm",
      },
    },
    Button: {
      defaultProps: {
        radius: "xl",
        color: "brand",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
