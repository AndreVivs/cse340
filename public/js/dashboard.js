const vehicleCtx = document.getElementById("vehiclesChart");
const userCtx = document.getElementById("usersChart");

if (vehicleCtx && classificationStats) {
  const vehicleLabels = classificationStats.map(
    (item) => item.classification_name
  );
  const vehicleCounts = classificationStats.map((item) => parseInt(item.count));

  new Chart(vehicleCtx, {
    type: "bar",
    data: {
      labels: vehicleLabels,
      datasets: [
        {
          label: "Vehicles by Classification",
          data: vehicleCounts,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          precision: 0,
        },
      },
    },
  });
}

if (userCtx && userStats) {
  const userLabels = userStats.map((item) => item.account_type);
  const userCounts = userStats.map((item) => parseInt(item.count));

  new Chart(userCtx, {
    type: "pie",
    data: {
      labels: userLabels,
      datasets: [
        {
          label: "Users by Account Type",
          data: userCounts,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  });
}
