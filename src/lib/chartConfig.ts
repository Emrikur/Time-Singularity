import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { prefersReducedMotion } from "./motion";

// Registered once here so every view that renders a chart shares the same setup
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);



//##############################################################################

// Canvas can't read CSS custom properties, so the token values are repeated here
export const barColors = {
  current: "#3557E8",
  other: "#B4C4F9",
  empty: "#E9EBF1",
  // One colour per company when a chart shows several companies side by side
  companies: ["#3557E8", "#7FA8FF", "#2A43C2", "#B4C4F9", "#5B8CFF"],
};

const tickStyle = { color: "#6B7385", font: { size: 11 } };
const reduceMotion = prefersReducedMotion();



//##############################################################################



export const barOptions: ChartOptions<"bar"> = {
  responsive:true,
  maintainAspectRatio:true,
  aspectRatio:1.2,
  // Bars grow in one after another; only on a fresh chart, not on hover/updates
  animation: reduceMotion ? false : {
    duration: 600,
    easing: "easeOutBack",
    delay: (ctx) => ctx.type === "data" && ctx.mode === "default" ? ctx.dataIndex * 45 : 0,
  },
  layout: { padding: { top: 20 } },
  datasets: {
    bar: {
      borderRadius: { topLeft: 7, topRight: 7, bottomLeft: 3, bottomRight: 3 },
      borderSkipped: false,
      maxBarThickness: 30,
    },
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: tickStyle },
    y: { grid: { color: "#EEF0F4" }, border: { display: false }, ticks: tickStyle },
  },
  plugins: {
    legend:{
      labels: {
        font:{size:12, weight:500},
        color: "#5A6275",
        padding: 10,
       boxWidth:12
      },
      position:"bottom" as const
    },
    // Value above each bar; empty bars get no label
    datalabels: {
      display: (ctx) => Boolean(ctx.dataset.data[ctx.dataIndex]),
      anchor: "end",
      align: "end",
      offset: 2,
      color: "#5A6275",
      font: {
        size: 12,
        weight: 500,
      }
    }
  }
}



//##############################################################################



export const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.0,
  animation: reduceMotion ? false : undefined,
  plugins: {
    legend:{
      labels: {
        font:{size:12, weight:500},
        color: "#5A6275",
        padding: 10,
       boxWidth:12
      },
      position:"bottom" as const
    },
    datalabels: {
      color: "#151823",
      font: {
        size: 13,
        weight: 500,
      }
    }
  }
}
