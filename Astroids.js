
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d') // The context is the canvas's web API that allows you to draw in the canvas. It is basically a giant Web API object, that allows you access to the canvas context. view it by console.log(ctx).

canvas.width = window.innerWidth //writing window is not necessary but it is part of the window object
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modelEl = document.querySelector('#modelEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

class Player {
  constructor (x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) // After radius comes start angle and end angle. Math.PI * 2 makes it a full circle. The last argument is the draw counter clockwise which since we are drawing a full circle it does not matter and could be either true or false.
    ctx.fillStyle = this.color
    ctx.fill()
  }
}

class Projectile {
  constructor (x, y, radius, color, velocity) {

    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) 
    ctx.fillStyle = this.color
    ctx.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor (x, y, radius, color, velocity) {

    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) 
    ctx.fillStyle = this.color
    ctx.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const friction = 0.99
class Particle {
  constructor (x, y, radius, color, velocity) {

    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) 
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.restore
  }

  update() {
    this.draw()
    this.velocity.x *= friction 
    this.velocity.y *= friction 
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, 'white')
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
  player = new Player(x, y, 10, 'white') 
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = score
  bigScoreEl.innerHTML = score
}

function spawnEnemies () {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4 // This line creates min and max enemy size

    let x
    let y

    if(Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }
    
    // Below is a template literal, notice the backticks and dollar sign with the curly braces
    const color = `hsl(${Math.random() * 360}, 50%, 50%)` // The first number needs to be a random number from 0 to 360 to randomize the colors of the enemies

    const angle = Math.atan2(
        canvas.height / 2 - y,
        canvas.width / 2 - x)
        
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      }
    
    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000)
}


const projectile = new Projectile(
  canvas.width / 2, 
  canvas.height / 2, 
  5,
  'red',
  {
    x: 1,
    y: 1
  }
)

let animationId
let score = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)' // this line and the fillRect on the next line change the background color and give the light trails effect
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  })

  projectiles.forEach((projectile, index) => {
    projectile.update()

    // removes projectiles from edges of screen
    if(projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height ){
      setTimeout(() => {
        projectiles.splice(index, 1)
       }, 0)
    }
  })
  enemies.forEach((enemy, index) => {
    enemy.update();

    //end game
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
      modelEl.style.display = 'flex'
      bigScoreEl.innerHTML = score;
    }

    projectiles.forEach((projectile, projectileIndex) => {
     const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      // When projectiles touch enemy
     if (dist - enemy.radius - projectile.radius < 1) 
       {

         // create explosions
         for (let i = 0; i < enemy.radius * 2; i++) {
           particles.push(
             new Particle(
              projectile.x,
              projectile.y, 
              Math.random() * 2, 
              enemy.color, 
            {
              x: (Math.random() - 0.5) * (Math.random() * 5), 
              y: (Math.random() - 0.5) * (Math.random() * 5)
            }))
         }
       
       if(enemy.radius - 10 > 5) { // This line shrinks the big enemies and also checks to make sure you can't incidentily make tiny impossible to hit enemies
        
        // increase the score
        score += 100
        scoreEl.innerHTML = score 
        
        gsap.to(enemy, {
            radius: enemy.radius - 10
         })
         setTimeout(() => {
          projectiles.splice(projectileIndex, 1)
         }, 0)
       } else {
         // remove enemy from scene altogether
         score += 250
         scoreEl.innerHTML = score
       setTimeout(() => {
        enemies.splice(index, 1)
        projectiles.splice(projectileIndex, 1)
       }, 0)
      
      }
     }
    })
  })
}


// The standard function that is under the hood of any Event Listener is an event function. If you add "event" as the parameter to the Event Listener and then console.log the event inside the function, you can see the click event and where the mouse was positioned.
// The client Y and Client X are the mouse coordinates inside of the pointer event
window.addEventListener('click', (event) => { // Window is unnecessary here, the code could alternatively read addEventListener('click') and it would still work
  
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2)
    
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }

  projectiles.push(new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    5,
    "white",
    velocity
  ))
})

startGameBtn.addEventListener('click', () => {
  init();
  animate();
  spawnEnemies();
  modelEl.style.display = 'none'
})

/* 
Need to determine where the mouse clicks on the screen, and once there need to determine
the x velocity and the y velocity so it will be a smooth transition.
1. Get the angle of the right triangle produced from the projection of the x and y 
coordiantes. 
2. We need to put that angle in an atan2() function produces the angle in radians
3. Get velocities of x and y by putting the angle in radians into the sin and cos ratios
sine gets the ratio of length of the triangle edge that is on the y axis to the hypotenuse
cos gets the ratio of the length of the x axis edge to the hypotenouse
*/