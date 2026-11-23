const stripeOptions = (clientSecret) => ({
  clientSecret,
  appearance: {
    theme: "night",
    variables: {
      colorPrimary: "#c9a84c",
      colorBackground: "#1a1714",
      colorText: "#f5eee6",
      colorDanger: "#df1b41",
      fontFamily: "Playfair Display, system-ui, sans-serif",
      borderRadius: "8px",
    },
    rules: {
      ".Input": {
        border: "1px solid rgba(245,238,230,0.15)",
        boxShadow: "none",
      },
      ".Input:focus": {
        border: "1px solid #c9a84c",
        boxShadow: "none",
      },
      ".AccordionItem": {
        border: "1px solid rgba(245,238,230,0.15)",
        boxShadow: "none",
      },
    },
  },
});

export { stripeOptions };
