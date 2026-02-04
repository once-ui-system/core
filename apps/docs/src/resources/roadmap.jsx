const roadmap = [
  {
    product: "Once UI Projects",
    brand: "blue",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "Chart states",
            description: "Add state examples to chart docs. (Related: Chart error state)",
            type: "documentation"
          },
          {
            title: "Hooks & utils",
            description: "Add hooks and utils to docs.",
            type: "documentation"
          },
        ]
      },
      {
        title: "In Progress",
        tasks: [
          {
            title: "Supa Hub",
            description: "Release Supa Hub for testing.",
            type: "feature"
          },
        ]
      },
      {
        title: "Done",
        tasks: [
          {
            title: "Once UI 1.6",
            description: "New components and accessibility improvements.",
            type: "feature"
          },
        ]
      }
    ]
  },
];

const task = {
  bug: { label: "Bug", color: "red" },
  feature: { label: "Feature", color: "green" },
  improvement: { label: "Improvement", color: "blue" },
  documentation: { label: "Docs", color: "magenta" },
  performance: { label: "Performance", color: "orange" },
  security: { label: "Security", color: "indigo" }
};

export { roadmap, task };