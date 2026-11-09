window.MAVIS_NAV_SECTIONS = [
  {
    id: "map",
    label: "Map",
    type: "map",
    groups: [
      ["Cloud & visibility", ["Surface Visibility", "Cloud Base", "Cloud Cover"]],
      ["Lightning", ["Observed Lightning"]],
      ["Precipitation", ["Precipitation Rate", "Forecast Precipitation Type", "Observed Precipitation Type", "Observed Precipitation Rate"]],
      ["Pressure", ["Surface Pressure"]],
      ["Satellite", ["Infrared Satellite", "Visible Satellite"]],
      ["Sea conditions", ["Sea Surface Current", "Significant Wave Height", "Significant Wave Height Contours", "Observed Sea Surface Temperature"]],
      ["Temperature", ["Surface Temperature", "Temperature FL020", "Temperature FL030", "Temperature FL050", "Temperature FL100"]],
      ["Wind", ["Surface Wind Gust", "Surface Wind Fletches", "Wind Fletches FL020", "Wind Fletches FL030", "Wind Fletches FL050", "Wind Fletches FL100"]]
    ]
  },
  {
    id: "briefing",
    label: "Briefing Products",
    items: ["Surface Pressure", "British Isles Analysis", "F214 UK Spot Winds", "F414 European Spot Winds", "F415 European Low-Level Significant Weather", "F215 UK Low-Level Significant Weather"]
  },
  { id: "regional", label: "Regional Reports", items: ["UK Regional Forecast", "North Atlantic Report", "European Regional Report"] },
  {
    id: "specialist",
    label: "Specialist Reports",
    items: ["Triggered Lightning Outlook", "Cross Border Advisories", "NATS 24h LVP (AM)", "NATS 24h LVP (PM)", "NATS PC CB/TS 0-3h Trajectory", "NATS TC & AC CB/TS 0-3h Trajectory", "De-icing", "MONIM", "Cross Sections", "Tide Times", "NSWSS", "Volcanic Ash"]
  },
  { id: "balloon", label: "Balloon Forecasts", items: ["Balloon Forecast Map", "Upper Air Forecast", "Launch Site Conditions"] },
  { id: "help", label: "Help & Information", items: ["Contact", "User Guide", "MAVIS Updates", "Licences", "MAVIS FAQs", "Privacy Policy", "Terms & Conditions", "Research Programme", "Accessibility Statement"] }
];
