const ctx = document.getElementById("characterChart");

const characterChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        borderWidth: 0,
      },
    ],
  },
  options: {
    scales: {
      y: {
        display: false,
        ticks: {
          beginAtZero: true,
          max: 255,
        },
      },
      x: {
        ticks: {
          autoSkip: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  },
});
