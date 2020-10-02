$( document ).ready(function(){

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };
    const csrftoken = getCookie('csrftoken');
    console.log(csrftoken);

    function changeResolution(canvas, scaleFactor) {
		// Set up CSS size.
		canvas.style.width = canvas.style.width || canvas.width + 'px';
		canvas.style.height = canvas.style.height || canvas.height + 'px';

		// Resize canvas and scale future draws.
		canvas.width = Math.ceil(canvas.width * scaleFactor);
		canvas.height = Math.ceil(canvas.height * scaleFactor);
		var ctx = canvas.getContext('2d');
		ctx.scale(scaleFactor, scaleFactor);
	}

	function setDPI(canvas, dpi) {
		// Set up CSS size.
		canvas.style.width = canvas.style.width || canvas.width + 'px';
		canvas.style.height = canvas.style.height || canvas.height + 'px';

		// Get size information.
		var scaleFactor = dpi / 96;
		var width = parseFloat(canvas.style.width);
		var height = parseFloat(canvas.style.height);

		// Backup the canvas contents.
		var oldScale = canvas.width / width;
		var backupScale = scaleFactor / oldScale;
		var backup = canvas.cloneNode(false);
		backup.getContext('2d').drawImage(canvas, 0, 0);

		// Resize the canvas.
		var ctx = canvas.getContext('2d');
		canvas.width = Math.ceil(width * scaleFactor);
		canvas.height = Math.ceil(height * scaleFactor);

		// Redraw the canvas image and scale future draws.
		ctx.setTransform(backupScale, 0, 0, backupScale, 0, 0);
		ctx.drawImage(backup, 0, 0);
		ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
	}

    // Set up the UI
    var sigText = document.getElementById("sig-dataUrl");
    var sigImage = document.getElementById("sig-image");
    var clearBtn = document.getElementById("sig-clearBtn");
    var submitBtn = document.getElementById("sig-submitBtn");
    var printBtn = document.getElementById("sig-printMoves");

    var moves = [];

    // Variables for referencing the canvas and 2dcanvas context
    var canvas,ctx;

    // Get the specific canvas element from the HTML document
    var canvas = document.getElementById('sig-canvas');

    jQuery.fn.redraw = function() {
        return this.hide(0, function() {
            $(this).show();
        });
    };

    // If the browser supports the canvas tag, get the 2d drawing context for this canvas
    if (canvas.getContext)
        ctx = canvas.getContext('2d');

    // Variables to keep track of the mouse position and left-button status
    var mouseX,mouseY,mouseDown=0;

    // Variables to keep track of the touch position
    var touchX,touchY;

    // Keep track of cycling through different hues each time a dot is drawn
    var hue=0;
    var lastX, lastY = -1;

    // Draws a dot at a specific position on the supplied canvas name
    // Parameters are: A canvas context, the x position, the y position, the size of the dot
    function drawDot(ctx,x,y,size) {
    // Instead of using RGB (red/green/blue) format for the drawing colour, since we're cycling through
    // hue values, it makes more sense to use HSLA, which is Hue, Saturation, Luminence
    // We can use fixed values for Saturation, Luminence and alpha, and just use the Hue value from our hue variable.
        sat=100; lum=50; a=255;

        // Select a fill style
        ctx.fillStyle = "hsla("+hue+","+sat+"%,"+lum+"%,"+(a/255)+")";

        // Draw a filled circle
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();

        // Update the hue - increase the "2" value here for a faster cycle through the different colours
        hue+=2;

        // Go back to the first hue if we've reached the end of the hue range
        if (hue>360)
            hue=0;
        }

    function drawLine(ctx,x,y,size) {

        // If lastX is not set, set lastX and lastY to the current position
        if (lastX==-1) {
            lastX=x;
	        lastY=y;
        }

        // Let's use black by setting RGB values to 0, and 255 alpha (completely opaque)
        r=0; g=0; b=0; a=255;

        // Select a fill style
        ctx.strokeStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";

        // Set the line "cap" style to round, so lines at different angles can join into each other
        ctx.lineCap = "round";
        //ctx.lineJoin = "round";

        // Draw a filled line
        ctx.beginPath();

	// First, move to the old (previous) position
	ctx.moveTo(lastX,lastY);

	// Now draw a line to the current touch/pointer position
	ctx.lineTo(x,y);

        // Set the line thickness and draw the line
        ctx.lineWidth = size;
        ctx.stroke();

        ctx.closePath();

	// Update the last position to reference the current position
	lastX=x;
    lastY=y;

    }

    // Clear the canvas context using the canvas width and height
    function clearCanvas(canvas,ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Keep track of the mouse button being pressed and draw a dot at current location
    function sketchpad_mouseDown() {
        mouseDown=1;
        //drawDot(ctx,mouseX,mouseY,10);
        drawLine(ctx, mouseX, mouseY,6);
        moves.push([mouseX, mouseY, 0]);

    }

    // Keep track of the mouse button being released
    function sketchpad_mouseUp() {
        mouseDown=0;

        // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
        lastX=-1;
        lastY=-1;
        moves.push([mouseX, mouseY, 1]);
    }

    // Keep track of the mouse position and draw a dot if mouse button is currently pressed
    function sketchpad_mouseMove(e) {
        // Update the mouse co-ordinates when moved
        getMousePos(e);

        // Draw a dot if the mouse button is currently being pressed
        if (mouseDown==1) {
            //drawDot(ctx,mouseX,mouseY,10);
            drawLine(ctx, mouseX, mouseY,6);
            moves.push([mouseX, mouseY, 0]);
        }

    }

    // Get the current mouse position relative to the top-left of the canvas
    function getMousePos(e) {

        if (e.offsetX) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }
        else if (e.layerX) {
            mouseX = e.layerX;
            mouseY = e.layerY;
        }
    }

    // Draw something when a touch start is detected
    function sketchpad_touchStart(e) {
        // Update the touch co-ordinates
        getTouchPos();

        //drawDot(ctx,touchX,touchY,10);
        drawLine(ctx, touchX, touchY,6);
        //moves.push([touchX, touchY, 0]);

        // Prevents an additional mousedown event being triggered
        e.preventDefault();
    }

    // Draw something and prevent the default scrolling when touch movement is detected
    function sketchpad_touchMove(e) {
        // Update the touch co-ordinates
        getTouchPos(e);

        // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
        //drawDot(ctx,touchX,touchY,10);
        drawLine(ctx, touchX, touchY,6);
        moves.push([touchX, touchY, 0]);

        // Prevent a scrolling action as a result of this touchmove triggering.
        e.preventDefault();
    }

    // Get the touch position relative to the top-left of the canvas
    // When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
    // but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
    // "target.offsetTop" to get the correct values in relation to the top left of the canvas.
    function getTouchPos(e) {
        //if (!e)
          //  var e = event;

        //if(e.touches) {
        //    if (e.touches.length == 1) { // Only deal with one finger
                var touch = e.touches[0]; // Get the information for finger #1
                touchX=touch.pageX - 100;//-touch.target.offsetLeft;
                touchY=touch.pageY - 50;//-touch.target.offsetTop;
        //    }
        //}
    }

    function sketchpad_touchEnd() {
        // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
        moves.push([lastX, lastY, 1]);

        lastX=-1;
        lastY=-1;

    }

    clearBtn.addEventListener("click", function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        moves = [];
    }, false);

    // Set-up the canvas and add our event handlers after the page has loaded
    (function init() {
        (function(){

            $(function(){
                // set width and height
                 ctx.canvas.width = $("#wrapper").width();
                 ctx.canvas.height = 400;
                // draw
                draw();

            });
        })();

        // Check that we have a valid context to draw on/with before adding event handlers
        if (ctx) {

            // React to mouse events on the canvas, and mouseup on the entire document
            canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
            canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
            canvas.addEventListener('mouseup', sketchpad_mouseUp, false);

            // React to touch events on the canvas
            canvas.addEventListener('touchstart', sketchpad_touchStart, false);
            canvas.addEventListener('touchend', sketchpad_touchEnd, false);
            canvas.addEventListener('touchmove', sketchpad_touchMove, false);
        }
    })();


    $("#sig-printMoves").click(function(e) {
        e.preventDefault();
        $.ajax({type: 'POST',
        url: 'fetch_data/',
        //headers: {'X-CSRFToken': csrftoken},
        data: { 'moves': moves },
        success: function (response) {
            if (response.result === 'OK') {
                if (response.data && typeof(response.data) === 'object') {
                    console.log("Success")
                }
            } else {
                console.log("Error")
            }
        }
        });
    });

});
