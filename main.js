const canvas= document.getElementById("canvas");
const context= canvas.getContext("2d");

function resizeCanvas(){
    canvas.width= window.innerWidth * 0.9;
    canvas.height= window.innerHeight * 0.9;
};

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

function main(){
    // Stickfigure Configurations
    const xStickfigurePosition= 100;
    const yStickfigurePosition= 50;
    const stickfiguresColor= "pink";
    const stickfigurestickness= 3;

    // Ground configuration
    const xGroundPosition= 0;
    const yGroundPosition= canvas.offsetHeight * 0.8;
    const heightGround= canvas.offsetHeight * 0.2;
    const widthGround= canvas.offsetWidth;
    
    const stickfigure= new Stickfigure(
        context, xStickfigurePosition, 
        yStickfigurePosition, stickfiguresColor, 
        stickfigurestickness
    );
    
    const ground= new Ground(
        context, xGroundPosition,
        yGroundPosition, heightGround,
        widthGround
    );

    function animate(){
        requestAnimationFrame(animate);
        stickfigure.draw();
        ground.draw();
    };
    animate();
};

main();