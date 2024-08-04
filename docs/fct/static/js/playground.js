/*
document.addEventListener('DOMContentLoaded', function() {
    const fctbox = document.getElementById('fct-box');
    const fctshapes = document.getElementById('fct-shape-container');
    let width = fctbox.getBoundingClientRect().width - 4;
    let height = fctbox.getBoundingClientRect().height - 4;
    fctbox.style.width = `${width}px`; // set width permanent
    fctbox.style.height = `${height}px`; // set height permanent

    const line = createLine(0, 0, width, height, "line");
    line.style.visibility = 'hidden';
    const point = document.createElement('div');
    point.style.position = 'absolute';
    point.style.left = `0px`;
    point.style.top = `0px`;
    point.style.width = '6px';
    point.style.height = '6px';
    point.style.backgroundColor = '#666666';
    point.style.borderRadius = '50%';
    point.style.zIndex = '901';
    document.getElementById('fct-line-container').appendChild(point);
    point.style.visibility = 'hidden';

    let shapeCoords = [
        [width, 0],
        [0, 0],
        [0, height],
        [width, height]
    ];
    createShape(shapeCoords, 'shape');

    let startX, startY;
    let finalStartX, finalStartY;
    let finalEndX, finalEndY;
    let clicked = false;
    let currShape = "";
    let workShape = "";

    fctbox.addEventListener('mousedown', function(event) {
        const rect = fctbox.getBoundingClientRect();
        startX = event.clientX - rect.left;
        startY = event.clientY - rect.top;
        point.style.left = `${startX-3}px`;
        point.style.top = `${startY-3}px`;
        clicked = true;
        workShape = currShape;
    });

    fctbox.addEventListener('mousemove', function(event) {
        if (!clicked) return;

        const rect = fctbox.getBoundingClientRect();
        const endX = event.clientX - rect.left;
        const endY = event.clientY - rect.top;

        // Get the shape element and its absolute position
        const shapeElement = document.getElementById(workShape);
        const shapeRect = shapeElement.getBoundingClientRect();
        const shapeOffsetX = shapeRect.left - fctbox.getBoundingClientRect().left;
        const shapeOffsetY = shapeRect.top - fctbox.getBoundingClientRect().top;

        // Get shape coordinates adjusted for shape's position
        let polygonCoords = getShapeCoords(shapeElement);
        polygonCoords = polygonCoords.map(([x, y]) => [x + shapeOffsetX, y + shapeOffsetY]);

        // Calculate intersections with polygon
        let { intersection1, intersection2 } = getPolygonIntersections(startX, startY, endX, endY, polygonCoords);

        // Determine final positions for the line
        finalStartX = startX;
        finalStartY = startY;
        finalEndX = endX;
        finalEndY = endY;

        if (intersection1) {
            finalEndX = intersection1.x;
            finalEndY = intersection1.y;
        }

        if (intersection2) {
            finalStartX = intersection2.x;
            finalStartY = intersection2.y;
        }

        // Modify the line based on the final start and end positions
        modifyLine(finalStartX, finalStartY, finalEndX, finalEndY, 'line');

        // Show line if distance is significant
        const distance = Math.sqrt((finalEndX - finalStartX) ** 2 + (finalEndY - finalStartY) ** 2);
        line.style.visibility = distance > 10 ? 'visible' : 'hidden';
        point.style.visibility = distance > 10 ? 'visible' : 'hidden';
    });

    fctbox.addEventListener('mouseleave', fctreset);
    fctbox.addEventListener('mouseup', function() {
        fctreset();
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            fctreset();
        }
    });

    function fctreset() {
        clicked = false;
        line.style.visibility = 'hidden';
        point.style.visibility = 'hidden';
    }

    fctshapes.addEventListener('mousemove', function(event) {
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach(shape => {
            const shapeRect = shape.getBoundingClientRect();
            const mouseX = event.clientX - shapeRect.left;
            const mouseY = event.clientY - shapeRect.top;
            const shapeCoords = getShapeCoords(shape);
            if (isPointInPolygon(mouseX, mouseY, shapeCoords)) {
                currShape = shape.id;
            }
        });

        function isPointInPolygon(x, y, points) {
            let inside = false;
            for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
                const xi = points[i][0], yi = points[i][1];
                const xj = points[j][0], yj = points[j][1];
                const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }
    });
});

function createShape(coords, id) {
    const shapeContainer = document.getElementById('fct-shape-container');

    const shape = document.createElement('div');
    shape.id = id;
    shape.className = 'shape';
    shape.style.position = 'absolute';
    shape.style.pointerEvents = 'none';

    const minX = Math.min(...coords.map(coord => coord[0]));
    const minY = Math.min(...coords.map(coord => coord[1]));
    const maxX = Math.max(...coords.map(coord => coord[0]));
    const maxY = Math.max(...coords.map(coord => coord[1]));

    coords = coords.map(coord => {
        let [x, y] = coord;
        if (x === minX) x += 1.5;
        if (x === maxX) x -= 1.5;
        if (y === minY) y += 1.5;
        if (y === maxY) y -= 1.5;
        return [x, y];
    });

    shape.style.left = `${minX}px`;
    shape.style.top = `${minY}px`;
    shape.style.width = `${maxX - minX}px`;
    shape.style.height = `${maxY - minY}px`;

    const points = coords.map(coord => `${coord[0] - minX}px ${coord[1] - minY}px`).join(', ');
    shape.style.clipPath = `polygon(${points})`;
    shape.style.backgroundColor = "#666666";
    shape.classList.add('shapeBg');

    shapeContainer.appendChild(shape);
    return shape;
}

function createLine(a, b, x, y, id) {
    let lineContainer = document.getElementById('fct-line-container');
    if (!lineContainer) {
        lineContainer = document.createElement('div');
        lineContainer.setAttribute('id', 'fct-line-container');
        lineContainer.style.position = 'absolute';
        lineContainer.style.top = '0';
        lineContainer.style.left = '0';
        lineContainer.style.width = '100%';
        lineContainer.style.height = '100%';
        lineContainer.style.pointerEvents = 'none';
        document.body.appendChild(lineContainer);
    }

    const line = document.createElement('div');
    line.id = id;
    line.style.position = 'absolute';
    line.style.width = `${Math.sqrt((x - a) ** 2 + (y - b) ** 2)}px`;
    line.style.height = '2px';
    line.style.backgroundColor = '#222222';
    line.style.transformOrigin = '0 0';
    line.style.transform = `rotate(${Math.atan2(y - b, x - a) * (180 / Math.PI)}deg)`;
    line.style.left = `${a}px`;
    line.style.top = `${b}px`;
    lineContainer.appendChild(line);
    return line;
}

function modifyLine(a, b, x, y, id) {
    const line = document.getElementById(id);
    if (!line) {
        console.error(`Line with ID ${id} not found.`);
        return;
    }

    line.style.width = `${Math.sqrt((x - a) ** 2 + (y - b) ** 2)}px`;
    line.style.transform = `rotate(${Math.atan2(y - b, x - a) * (180 / Math.PI)}deg)`;
    line.style.left = `${a}px`;
    line.style.top = `${b}px`;
}

function getShapeCoords(shape) {
    const clipPath = shape.style.clipPath;
    if (!clipPath || !clipPath.startsWith('polygon')) {
        console.error('Invalid or missing clip-path');
        return [];
    }
    const pointsString = clipPath.match(/polygon\(([^)]+)\)/)[1];
    const points = pointsString.split(',').map(point => {
        const [x, y] = point.trim().replace(/[^\d\s.-]/g, '').split(' ').map(Number);
        if (isNaN(x) || isNaN(y)) {
            console.error('Invalid point:', point);
        }
        return [x, y];
    });
    return points;
}

function getPolygonIntersections(x1, y1, x2, y2, polygonCoords) {
    let intersections = [];

    for (let i = 0; i < polygonCoords.length; i++) {
        const p1 = polygonCoords[i];
        const p2 = polygonCoords[(i + 1) % polygonCoords.length];
        const intersection = getLineIntersection(x1, y1, x2, y2, p1[0], p1[1], p2[0], p2[1]);

        if (intersection) {
            intersections.push(intersection);
        }
    }

    if (intersections.length < 2) {
        return { intersection1: null, intersection2: null };
    }

    // Sort intersections based on their distance from (x1, y1)
    intersections.sort((a, b) => {
        const distA = Math.sqrt((a.x - x1) ** 2 + (a.y - y1) ** 2);
        const distB = Math.sqrt((b.x - x1) ** 2 + (b.y - y1) ** 2);
        return distB - distA; // Descending order
    });

    return { intersection1: intersections[0], intersection2: intersections[1] };
}

function getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return null;

    const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
    const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

    if (isPointOnLineSegment(x3, y3, x4, y4, x, y)) {
        return { x, y };
    }

    return null;
}

function isPointOnLineSegment(x1, y1, x2, y2, x, y) {
    return Math.min(x1, x2) <= x && x <= Math.max(x1, x2) && Math.min(y1, y2) <= y && y <= Math.max(y1, y2);
}

*/
