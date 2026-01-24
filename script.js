
// Define the questions and concise labels
const qualities = [
    { key: "01 of 14: Biblical Discernment", label: "Discernment" },
    { key: "02 of 14: Kingdom Focus", label: "Kingdom Focus" },
    { key: "03 of 14: Obedience & Alignment", label: "Obedience" },
    { key: "04 of 14: Faith & Action", label: "Faith" },
    { key: "05 of 14: Kingdom Priorities", label: "Priorities" },
    { key: "06 of 14: Living Witness", label: "Witness" },
    { key: "07 of 14: Body Ministry", label: "Ministry" },
    { key: "08 of 14: Gospel Sharing", label: "Gospel" },
    { key: "09 of 14: Spiritual Discernment (Fruit)", label: "Fruit" },
    { key: "10 of 14: Biblical Wisdom", label: "Wisdom" },
    { key: "11 of 14: Understanding the Heart", label: "Empathy" },
    { key: "12 of 14: Living Example", label: "Example" },
    { key: "13 of 14: Sharing the Testimony", label: "Testimony" },
    { key: "14 of 14: Building Godly Relationships", label: "Relationships" },
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