const canvas= document.getElementById("canvas");
const context= canvas.getContext("2d");

function setCanvasSize(){
    canvas.width= window.innerWidth * 0.9;
    canvas.height= window.innerHeight * 0.9;
}

setCanvasSize()
console.log(canvas.height)
console.log(canvas.width)

const configuration= {
    stickfigure: {
        x: 10 + (canvas.offsetHeight * 0.05), 
        y: canvas.offsetHeight * 0.575, 
        color: "pink", 
        tickness: 3,
        radius: canvas.offsetHeight * 0.05
    }, 
    ground: {
        x: 0, 
        y: canvas.offsetHeight * 0.8, 
        height: canvas.offsetHeight * 0.2, 
        width: canvas.offsetWidth
    }
};

let stickfigure= new Stickfigure(
    context, 
    configuration.stickfigure.x, 
    configuration.stickfigure.y, 
    configuration.stickfigure.color, 
    configuration.stickfigure.tickness, 
    configuration.stickfigure.radius
);

let ground= new Ground(
    context, 
    configuration.ground.x, 
    configuration.ground.y, 
    configuration.ground.height, 
    configuration.ground.width
);

function resizeCanvas(){
    setCanvasSize();
    // Update stickfigure configuration
    configuration.stickfigure.x= 10 + (canvas.offsetHeight * 0.05);
    configuration.stickfigure.y= canvas.offsetHeight * 0.575;
    configuration.stickfigure.radius= canvas.offsetHeight * 0.05

    stickfigure= new Stickfigure(
        context, 
        configuration.stickfigure.x, 
        configuration.stickfigure.y, 
        configuration.stickfigure.color, 
        configuration.stickfigure.tickness, 
        configuration.stickfigure.radius
    )
    
    // Update ground configuration
    configuration.ground.y= canvas.offsetHeight * 0.8;
    configuration.ground.height= canvas.offsetHeight * 0.2; 
    configuration.ground.width= canvas.offsetWidth;
    // OK, recreate a new ground instance with the new dimensions
    ground= new Ground(
        context, 
        configuration.ground.x, 
        configuration.ground.y, 
        configuration.ground.height, 
        configuration.ground.width
    );
};

window.addEventListener("resize", resizeCanvas);

function main(){
    function animate(){
        requestAnimationFrame(animate);

        context.clearRect(
            0, 0, 
            canvas.width, 
            canvas.height
        );

        stickfigure.draw();
        ground.draw();
    };
    animate();
};

main();