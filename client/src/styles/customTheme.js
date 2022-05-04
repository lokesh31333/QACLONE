import { createMuiTheme } from "@material-ui/core/styles";

const customTheme = (darkMode) =>
  createMuiTheme({
    palette: {
      type: darkMode ? "dark" : "light",
      primary: {
        // main: darkMode ? '#c197db' : '#964ec2',
        main: darkMode ? "#f78a36" : "#ff6f00",
      },
      secondary: {
        main: darkMode ? "#ff6f00" : "#ff6f00",
      },
    },
    overrides: {
      MuiMenuItem: {
        root: {
          "&$selected": {
            borderRight: "4px solid #f59542",
            fontWeight: "700",
          },
        },
      },
      MuiPopover: {
        paper: {
          borderRadius: 2,
        },
      },
      MuiButton: {
        root: {
          borderRadius: 4,
          textTransform: "none",
        },
      },
      MuiChip: {
        root: {
          borderRadius: 3,
          padding: "0px",
        },
        outlined: {
          backgroundColor: darkMode ? "#c197db15" : "#964ec215",
        },
      },
    },
    props: {
      MuiButton: {
        disableElevation: true,
      },
    },
  });

export default customTheme;
