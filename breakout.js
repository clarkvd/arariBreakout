var score = 0;
var level = 1;
var lives = 3;
var currentBlue = [0, 0, 255];
var currentOrange = [255, 165, 0];
const majorColors = [[255, 0, 0], [255, 165, 0], [255, 255, 0], [0, 128, 0], [0, 0, 255], [128, 0, 128]];
var addPaddle = 0;
var levelList = [0];

export class breakout {
    
    constructor(canvas, keyMap) {

        // save canvas and keyMap as members
        this.canvas = canvas;
        this.keyMap = keyMap;
        
        // set size of canvas
        canvas.width = 640;
        canvas.height = 480;
        
        // save canvas context as member
        this.ctx = canvas.getContext('2d'); 
        
        document.getElementById('level').innerHTML = "Level: " + level;
        document.getElementById('lives').innerHTML = "Lives Left: " + lives;

        this.initilizeBox()
        this.losecounter = 0;
        this.initilizeBrick()

        // Set up the obstacle (paddle on the left side)
        this.obstacle = new Box();
        this.obstacle.minX = 280;
        this.obstacle.minY = 400;
        this.obstacle.width = 100;
        this.obstacle.height = 30;
        this.obstacle.color = [255, 255, 255];  
        this.obstacle.isPaddle = true;
        
        this.gameOver = false;
        this.nextLevel = false;
        
        
        
        
        // prevDraw is a member variable used for throttling framerate
        this.prevDraw = 0;
                
    }
    initilizeBox(){
        this.box = new Box();
        this.box.isBall = true;
        this.box.radius = 10;
        this.box.xVel = 2; // units: pixels per frame
        this.box.yVel = 2;
        this.box.minX =  Math.round(Math.random()*480);
        this.box.minY =  180;
        //this.box.width = 20;
        //this.box.height = 20;
    }
    initilizeBrick(){
        this.bricks = [];
        for (let i = 0; i < 40; i++) {
            this.bricks.push(new Box());  
            this.bricks[i].minX = i % 10 * 65
            this.bricks[i].minY = Math.floor(i / 10) * 30 + 50;
            this.bricks[i].width = 55;
            this.bricks[i].height = 20;
            this.bricks[i].color = this.getColor(i);
            this.bricks[i].status = "active"
            this.bricks[i].breakable = "yes"
            this.bricks[i].count = 1
            this.bricks[i].small = false;
            
            let random1 = Math.round(Math.random()*(30*level/5));
            if (random1===0){
                this.bricks[i].placeholder = this.getColor(i);
                this.bricks[i].count = level+1
                this.bricks[i].color = [255,255,255];
            }
            let random2 = Math.round(Math.random()*(30*level/5));
            if (random2===0){
                this.bricks[i].minX += 10;
                this.bricks[i].minY += 5;
                this.bricks[i].width -= 20;
                this.bricks[i].height -= 10;
                this.bricks[i].small = true;
            }
            
        }
        
    }
    getColor(pos) {
        const blue = currentBlue;
        const orange = currentOrange;
        const color = [];

        for (let i = 0; i < 3; i++) {
            color[i] = Math.round(blue[i] + (orange[i] - blue[i]) * (pos / 40));
        }
        return color;
    }
    
    mainLoop() {
        
        this.obstacle.width = 100 + addPaddle;
        // Compute the FPS
        // First get #milliseconds since previous draw
        const elapsed = performance.now() - this.prevDraw;

        if (elapsed < 1000/60) {
            return;
        }
        const fps = 1200 / elapsed;
        // Write the FPS in a <p> element.
        //document.getElementById('fps').innerHTML = "fps: " + fps;
        
        this.update();
        this.draw();
    }
    update(){

        // Update the obstacle using keyboard info
        if (this.keyMap['ArrowLeft']) {
            this.obstacle.minX -= 8;
            if (this.obstacle.minX < 0) {
                this.obstacle.minX = 0;
            }
        }
        if (this.keyMap['ArrowRight']) {
            this.obstacle.minX += 8;
            if (this.obstacle.minX + this.obstacle.width > this.canvas.width) {
                this.obstacle.minX = this.canvas.width - this.obstacle.width;
            }
        }
        
        let obstacles = [this.obstacle];
        
        const topEdge = new Box();
        topEdge.minX = 0;
        topEdge.minY = -10;
        topEdge.width = this.canvas.width;
        topEdge.height = 10;
        obstacles.push(topEdge);
        
        const leftEdge = new Box();
        leftEdge.minX = -10;
        leftEdge.minY = 0;
        leftEdge.width = 10;
        leftEdge.height = this.canvas.height;
        obstacles.push(leftEdge);
        
        const rightEdge = new Box();
        rightEdge.minX = this.canvas.width;
        rightEdge.minY = 0;
        rightEdge.width = 10;
        rightEdge.height = this.canvas.height;
        obstacles.push(rightEdge);
        
        this.box.update(this.canvas, obstacles.concat(this.bricks));;
        
        if (this.box.minY > this.canvas.height) {
            if (this.losecounter < 2){
                lives--;
                document.getElementById('lives').innerHTML = "Lives Left = " + lives;
                this.initilizeBox();
                this.losecounter++;
            }
            else{
            // Ball too far down -> I lost
                this.ctx.fillStyle = 'rgb(255,255,255)';
                document.getElementById('gameover').innerHTML = "YOU LOSE. FINAL SCORE: " + score ;
                this.gameOver = true;
                
                document.getElementById('level').style.display = 'none';
                document.getElementById('score').style.display = 'none';
                document.getElementById('lives').style.display = 'none';
                document.getElementById('atari').style.display = 'none';

            }
        }
        
        
        
    }
    draw(){
        // clear background
        this.ctx.fillStyle = "rgb(10, 10, 10)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);        
        
        
        if (score % 40 === 0 && levelList.indexOf(score) === -1){
            levelList.push(score)
            do{
                currentBlue = majorColors[Math.floor(Math.random() * majorColors.length)];
                currentOrange = majorColors[Math.floor(Math.random() * majorColors.length)];
            }while (currentBlue === currentOrange);
            console.log(currentBlue, currentOrange)
            this.initilizeBrick();
            this.initilizeBox();
            level++;
            addPaddle = 0;
            
            document.getElementById('level').innerHTML = "Level: " + level;
        }

        
        // Draw the box
        this.box.draw(this.ctx);
        
        this.obstacle.draw(this.ctx);
        
        this.drawGooglyEyes(this.ctx, this.obstacle);
        
        
        for(let i=0;i<this.bricks.length;i++){
            if (this.bricks[i].status === "active"){
                this.bricks[i].draw(this.ctx)
            }
        }

        // Save the value of performance.now() for FPS calculation
        this.prevDraw = performance.now();
    }
    
    drawGooglyEyes(ctx, paddle) {
        const eyeRadius = 10;
        const pupilRadius = eyeRadius / 2;
        const xEyeDis = 30;
        const yEyeDis = paddle.height / 2;
        const eyePupDis = eyeRadius - pupilRadius;

        let pupXPos = this.box.minX - paddle.minX;
        let pupYPos = this.box.minY - paddle.minY;

        const distance = Math.sqrt(Math.pow(pupXPos, 2) + Math.pow(pupYPos, 2));

        if (distance > eyePupDis) {
            pupXPos *= eyePupDis / distance;
            pupYPos *= eyePupDis / distance;
        }

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(paddle.minX + xEyeDis, paddle.minY + yEyeDis, eyeRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(paddle.minX + xEyeDis + pupXPos, paddle.minY + yEyeDis + pupYPos, pupilRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(paddle.minX + paddle.width - xEyeDis, paddle.minY + yEyeDis, eyeRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(paddle.minX + paddle.width - xEyeDis + pupXPos, paddle.minY + yEyeDis + pupYPos, pupilRadius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class Box {
    constructor() {
        this.minX = 10;
        this.minY = 30;
        
        this.isBall = false;
        this.radius = 10;
        
        this.width = 20;
        this.height = 20;
        this.xVel = 1;
        this.yVel = 1;  
        this.color = [255, 0, 0];
        this.status = "active";
        this.breakable = "no"
        this.isPaddle = false;

        this.contrail = [];
        
        document.getElementById('score').innerHTML = "Score: " + score;
    }

    randomizeColor() {
        this.color[0] = Math.round(Math.random()*255);
        this.color[1] = Math.round(Math.random()*255);
        this.color[2] = Math.round(Math.random()*255);
    }
    
    intersects(box2) {

        if (this.isBall){

            let closestX = Math.max(box2.minX, Math.min(this.minX, box2.minX + box2.width));
            let closestY = Math.max(box2.minY, Math.min(this.minY, box2.minY + box2.height));

            let dx = this.minX - closestX;
            let dy = this.minY - closestY;
            
            if ((dx * dx + dy * dy) < (this.radius * this.radius)){
                return true;
            }
            else{
                return false;
            }

            return ;
        } 
        else{
            // the x-intervals
            const xi1 = [this.minX, this.minX + this.width];
            const xi2 = [box2.minX, box2.minX + box2.width];

            if (!intervalsOverlap(xi1, xi2)) {
                return false;
            }

            const yi1 = [this.minY, this.minY + this.height];
            const yi2 = [box2.minY, box2.minY + box2.height];

            return intervalsOverlap(yi1, yi2);
        }
        
    }

    update(canvas, obstacles) {
        
        // move x
        this.minX += this.xVel;
        
        for (const o of obstacles) {
            if (this.intersects(o)&& o.status==="active") {
                // undo the step that caused the collision
                this.minX -= this.xVel;
                // reverse xVel to bounce
                this.xVel *= -1;
                
                if (o.breakable === "yes" && o.status === "active"){
                    if(o.count > 1){
                        o.count--;
                        o.color[0] = 255-(Math.round(255-o.placeholder[0]/o.count))
                        o.color[1] = 255-(Math.round(255-o.placeholder[1]/o.count))
                        o.color[2] = 255-(Math.round(255-o.placeholder[2]/o.count))
                    }
                    else{
                        o.status = "broken";
                        score++;
                        document.getElementById('score').innerHTML = "Score = " + score;
                        if (o.small){
                            addPaddle += 10;
                        }
                    }
                    
                    if (!o.isPaddle){
                        this.makeNoise()
                    }
                }
            }
        }

        // move y
        this.minY += this.yVel;
        
        for (const o of obstacles) {
            if (this.intersects(o) && o.status==="active") {

                // undo the step that caused the collision
                this.minY -= this.yVel;
                // reverse yVel to bounce
                this.yVel *= -1;
                
                if (o.breakable === "yes" && o.status === "active"){
                    if(o.count > 1){
                        
                        o.count--;
                        o.color[0] = 255-(Math.round(255-o.placeholder[0]/o.count))
                        o.color[1] = 255-(Math.round(255-o.placeholder[1]/o.count))
                        o.color[2] = 255-(Math.round(255-o.placeholder[2]/o.count))
                    }
                    else{
                        o.status = "broken";
                        score++;
                        document.getElementById('score').innerHTML = "Score = " + score;
                        if (o.small){
                            addPaddle += 10;
                        }
                    }
                   
                    if (!o.isPaddle){
                        this.makeNoise()
                    }
                }
                if (o.isPaddle) {
                    // calculate the x-coordinate of the ball relative to the center of the paddle
                    let relativeX = this.minX + (this.width / 2) - (o.minX + (o.width / 2));
                    this.xVel = relativeX * 0.25;
        
                }
            }   
        }
        
    }
    
    makeNoise(){
        var context = new AudioContext()
        var p = context.createOscillator()
        var  g = context.createGain()
        var frequency = 1109.0
        p.frequency.value = frequency
        p.connect(g)
        g.connect(context.destination)
        p.start(0)
        g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 1)
    }
    

    draw(ctx) {
        const [r,g,b] = this.color;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        if (this.isBall) {
            
            const trailLength = 50;

            this.contrail.push({ x: this.minX, y: this.minY });
            if (this.contrail.length > trailLength) {
                for(let i=0;i<this.contrail.length-1;i++){
                    this.contrail[i] = this.contrail[i+1];
                }
                this.contrail.pop();
            }

            ctx.beginPath();
            for (let i = 0; i < this.contrail.length - 1; i++) {
                const alpha = i / trailLength;
                ctx.strokeStyle = `rgba(0, 0, 255, ${alpha})`;
                ctx.lineWidth = 8;
                ctx.beginPath(); 
                ctx.moveTo(this.contrail[i].x, this.contrail[i].y);
                ctx.lineTo(this.contrail[i + 1].x, this.contrail[i + 1].y);
                ctx.stroke();
            }
            
            
            ctx.beginPath();
            ctx.arc(this.minX, this.minY, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        } 
        else {
            ctx.fillRect(this.minX, this.minY, this.width, this.height);
        }           
    }

}

function intervalsOverlap(int1, int2) {
    const [a,b] = int1;
    const [c,d] = int2;
    if (a > c) {
        return intervalsOverlap(int2, int1);
    }
    return (b > c);
}