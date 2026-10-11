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



export const barOptions = {
  responsive:true,
  maintainAspectRatio:true,
  aspectRatio:1.2,
  plugins: {
    legend:{
      labels: {
        font:{size:16, weight:"bold" as const},
        size: 16,
        padding: 10,
       boxWidth:14
      },
      position:"bottom" as const
    },
    datalabels: {
      color: "black" as const,
      font: {
        size: 20,
        weight: "normal" as const,
      }
    }
  }
}



//##############################################################################



export const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.0,
  plugins: {
    legend:{
      labels: {
        font:{size:16, weight:"bold" as const},
        size: 16,
        padding: 10,
       boxWidth:14
      },
      position:"bottom" as const
    },
    datalabels: {
      color: "black" as const,
      font: {
        size: 18,
        weight: "normal" as const,
      }
    }
  }
}
