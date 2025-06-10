
// Define the questions and concise labels
const qualities = [
    { key: "Biblical Discernment", label: "Discernment" },
    { key: "Kingdom Focus", label: "Kingdom Focus" },
    { key: "Obedience & Alignment", label: "Obedience" },
    { key: "Faith & Action", label: "Faith" },
    { key: "Kingdom Priorities", label: "Priorities" },
    { key: "Living Witness", label: "Witness" },
    { key: "Body Ministry", label: "Ministry" },
    { key: "Gospel Sharing", label: "Gospel" },
    { key: "Spiritual Discernment (Fruit)", label: "Fruit" },
    { key: "Biblical Wisdom", label: "Wisdom" },
    { key: "Understanding the Heart", label: "Empathy" },
    { key: "Living Example", label: "Example" },
    { key: "Sharing the Testimony", label: "Testimony" },
    { key: "Building Godly Relationships", label: "Relationships" },
];

// Score descriptions
const scoreDescriptions = {
    0: "Rarely / Not at all",
    1: "Occasionally / Minimal",
    2: "Sometimes / Moderate",
    3: "Sometimes / Moderate",
    4: "Frequently / Strongly",
    5: "Consistently / Strongly"
};

const scores = new Array(qualities.length).fill(0);

const questionList = document.getElementById("questionList");

// Generate question sliders dynamically
qualities.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";

    div.innerHTML = `
<div class="input-row">
<label for="q${index}">${q.key}</label>
<input type="range" min="0" max="5" value="0" step="1" id="q${index}" data-index="${index}" />
</div>
<div class="score-description" id="desc${index}">${scoreDescriptions[0]}</div>
`;
    questionList.appendChild(div);
});

// Initialize radar chart
const ctx = document.getElementById('radarChart').getContext('2d');
const radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: qualities.map(q => q.label),
        datasets: [{
            label: 'Self-Assessment',
            data: scores,
            backgroundColor: 'rgba(47, 128, 237, 0.2)',
            borderColor: 'rgba(47, 128, 237, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(47, 128, 237, 1)'
        }]
    },
    options: {
        responsive: true,
        scales: {
            r: {
                suggestedMin: 0,
                suggestedMax: 5,
                ticks: {
                    stepSize: 1
                },
                pointLabels: {
                    font: {
                        size: 12
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

// Event delegation for sliders
questionList.addEventListener('input', function (e) {
    if (e.target && e.target.type === "range") {
        const index = e.target.dataset.index;
        const value = parseInt(e.target.value, 10);
        scores[index] = value;

        // Update description
        const desc = document.getElementById(`desc${index}`);
        desc.innerText = scoreDescriptions[value] || "";

        // Update radar chart
        radarChart.data.datasets[0].data = scores;
        radarChart.update();
    }
});
