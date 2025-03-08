const canvas= document.getElementById("canvas")
const context= canvas.getContext("2d")

function resizeCanvas(){
    canvas.width= window.innerWidth;
    canvas.height= window.innerHeight;
};

resizeCanvas()

window.addEventListener("resize", resizeCanvas)

function main(){
    const stickfigure= new Stickfigure(context, 100, 50, "pink", 20)
    
    function animate(){
        requestAnimationFrame(animate);
        stickfigure.draw()
    }
    animate()
}
main()