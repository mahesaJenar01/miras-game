const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

function setCanvasSize() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
}

setCanvasSize();

const configuration = {
    sky: {
        width: canvas.width,
        height: canvas.height
    },
    sun: {
        x: canvas.width * 0.75,
        y: canvas.height * 0.2,
        radius: canvas.height * 0.06
    },
    clouds: [
        { x: canvas.width * 0.1, y: canvas.height * 0.15, size: canvas.height * 0.03, speed: 0.1 },
        { x: canvas.width * 0.3, y: canvas.height * 0.25, size: canvas.height * 0.04, speed: 0.05 },
        { x: canvas.width * 0.6, y: canvas.height * 0.1, size: canvas.height * 0.035, speed: 0.07 },
        { x: canvas.width * 0.8, y: canvas.height * 0.3, size: canvas.height * 0.025, speed: 0.12 }
    ],
    stickfigure: {
        x: 10 + (canvas.offsetHeight * 0.05),
        y: canvas.offsetHeight * 0.575,
        color: "#FF69B4", // Changed to hot pink for a more girly look
        tickness: 3,
        radius: canvas.offsetHeight * 0.05
    },
    ground: {
        x: 0,
        y: canvas.offsetHeight * 0.8,
        height: canvas.offsetHeight * 0.2,
        width: canvas.offsetWidth
    },
    // New property to control the scrolling speed of the scene
    gameSpeed: 2
};

// Create elements
let sky = new Sky(context, configuration.sky.width, configuration.sky.height);
let sun = new Sun(context, configuration.sun.x, configuration.sun.y, configuration.sun.radius);

let clouds = [];
for (const cloudConfig of configuration.clouds) {
    clouds.push(new Cloud(context, cloudConfig.x, cloudConfig.y, cloudConfig.size, cloudConfig.speed));
}

let stickfigure = new Stickfigure(
    context,
    configuration.stickfigure.x,
    configuration.stickfigure.y,
    configuration.stickfigure.color,
    configuration.stickfigure.tickness,
    configuration.stickfigure.radius
);

let ground = new Ground(
    context,
    configuration.ground.x,
    configuration.ground.y,
    configuration.ground.height,
    configuration.ground.width
);

function resizeCanvas() {
    setCanvasSize();
    
    // Update sky configuration
    configuration.sky.width = canvas.width;
    configuration.sky.height = canvas.height;
    sky = new Sky(context, configuration.sky.width, configuration.sky.height);
    
    // Update sun configuration
    configuration.sun.x = canvas.width * 0.75;
    configuration.sun.y = canvas.height * 0.2;
    configuration.sun.radius = canvas.height * 0.06;
    sun = new Sun(context, configuration.sun.x, configuration.sun.y, configuration.sun.radius);
    
    // Update clouds configuration
    configuration.clouds = [
        { x: canvas.width * 0.1, y: canvas.height * 0.15, size: canvas.height * 0.03, speed: 0.1 },
        { x: canvas.width * 0.3, y: canvas.height * 0.25, size: canvas.height * 0.04, speed: 0.05 },
        { x: canvas.width * 0.6, y: canvas.height * 0.1, size: canvas.height * 0.035, speed: 0.07 },
        { x: canvas.width * 0.8, y: canvas.height * 0.3, size: canvas.height * 0.025, speed: 0.12 }
    ];
    
    clouds = [];
    for (const cloudConfig of configuration.clouds) {
        clouds.push(new Cloud(context, cloudConfig.x, cloudConfig.y, cloudConfig.size, cloudConfig.speed));
    }
    
    // Update stickfigure configuration
    configuration.stickfigure.x = 10 + (canvas.offsetHeight * 0.05);
    configuration.stickfigure.y = canvas.offsetHeight * 0.575;
    configuration.stickfigure.radius = canvas.offsetHeight * 0.05;

    stickfigure = new Stickfigure(
        context,
        configuration.stickfigure.x,
        configuration.stickfigure.y,
        configuration.stickfigure.color,
        configuration.stickfigure.tickness,
        configuration.stickfigure.radius
    );
    
    // Update ground configuration
    configuration.ground.y = canvas.offsetHeight * 0.8;
    configuration.ground.height = canvas.offsetHeight * 0.2;
    configuration.ground.width = canvas.offsetWidth;
    
    ground = new Ground(
        context,
        configuration.ground.x,
        configuration.ground.y,
        configuration.ground.height,
        configuration.ground.width
    );
}

window.addEventListener("resize", resizeCanvas);