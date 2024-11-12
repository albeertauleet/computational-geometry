/**
 TODO Replace this by your own, correct, triangulation function
 Triangles should be return as arrays of array of indexes
 e.g., [[1,2,3],[2,3,4]] encodes two triangles, where the indices are relative to the array points
**/



class Node {
	constructor(points) {
		this.points = points;
		this.subtree = [null, null, null];
	};

	getPoints(){
		return this.points;
	}
	haveSubtree(){
		return this.subtree[0] != null || this.subtree[1] != null || this.subtree[2] != null;
	}

	//pre: we assume i >= 0 and i < this.subtree.length
	getSubtree(i){
		
		return this.subtree[i];
	}
	
	setSubtree(i, node){
		this.subtree[i] = node;
	}

}

function getBoundingPoints(points){
	let minX = points[0].x;
	let minY = points[0].y;
	let maxX = points[0].x;
	let maxY = points[0].y;


	for (let i = 0; i < points.length; i++)
	{
		if (points[i].x < minX) minX = points[i].x;
		if (points[i].x > maxX) maxX = points[i].x;
		if (points[i].y < minY) minY = points[i].y;
		if (points[i].y > maxY) maxY = points[i].y;
	}

	return {'a': minX, 'b': minY, 'c': maxX, 'd': maxY};
	
}

function computeTriangulation(points) {
	// Wrong code! Just connects consecutive three after sorting by x-coord
	// Note that this does NOT return a triangulation, just a subset of it
	//var newPoints = points.sort(function(a,b) { if ((a.x) < (b.x)) return -1; else return 1;})
	var BB = getBoundingPoints(points);

	var W = BB.c - BB.a + 10;
	var H = BB.d - BB.b + 10;
	
	//Colocamos los puntos del triangulo contenedor al principio del array
	points.unshift({'x': BB.a-W, 'y': BB.b-H, 'z': 10.0});
	points.unshift({'x': BB.c+W, 'y': BB.b-H, 'z': 10.0});
	points.unshift({'x': (BB.a+BB.c)/2, 'y': BB.d+H, 'z': 10.0});

	let root = new Node([0, 1, 2]);
	
	for (let i = 3; i < points.length; ++i)
	{
		var node = root;
		var inside = false;
		var inline = false;
		var error = false;
		var containing_nodes = null;
		while (!inside && !inline && !error)
		{
			if (!node.haveSubtree())
			{
				inside = true;
			}
			else
			{
				containing_nodes = triangulate(node, points[i],  points);
				if (containing_nodes == null) error = true;
				else if(containing_nodes.length == 1) node = containing_nodes[0];
				else
				{
					inline = true;
				}
			}
		}
		if (error)
		{
			console.log("Error");
			continue;
		}
		else if (inside)
		{
			node.setSubtree(0, new Node([node.getPoints()[0], node.getPoints()[1], i]));
			console.log("Añadidos 1:", node.getPoints()[0], node.getPoints()[1], i);
			node.setSubtree(1, new Node([node.getPoints()[1], node.getPoints()[2], i]));
			console.log("Añadidos 2:", node.getPoints()[1], node.getPoints()[2], i);
			node.setSubtree(2, new Node([node.getPoints()[2], node.getPoints()[0], i]));
			console.log("Añadidos 3:", node.getPoints()[2], node.getPoints()[0], i);
			
		}
	
		
		else
		{
			let n1 = containing_nodes[0];
			let n2 = containing_nodes[1];

			if (n1 && n2) {
				n1 = find_smallest(n1, points[i], points);
				n2 = find_smallest(n2, points[i], points);
				var points_same_segment_n1 = colineal(n1, points[i], points);	
				var points_same_segment_n2 = colineal(n2, points[i], points);

				n1.setSubtree(0, new Node([points_same_segment_n1[0], points_same_segment_n1[2], i]));
				console.log("Añadidos 4:", points_same_segment_n1[0], points_same_segment_n1[2], i);
				n1.setSubtree(1, new Node([points_same_segment_n1[2], points_same_segment_n1[1], i]));	
				console.log("Añadidos 5:", points_same_segment_n1[2], points_same_segment_n1[1], i);


				n2.setSubtree(0, new Node([points_same_segment_n2[0], points_same_segment_n2[2], i]));
				console.log("Añadidos 6:", points_same_segment_n2[0], points_same_segment_n2[2], i);
				n2.setSubtree(1, new Node([points_same_segment_n2[2], points_same_segment_n2[1], i]));
				console.log("Añadidos 7:", points_same_segment_n2[2], points_same_segment_n2[1], i);
			}

		}
		

	

	}
	

	var outputTriangles = new Array();
	outputTriangles = Triangles(root);	
	return outputTriangles;
}

function find_smallest(node, p, points) {
	if (!node.haveSubtree()) 
	{
			console.log("TRIANGLE SMALLEST:", node);
			return node;
	}
	else
	{
		for (let i = 0; i < node.subtree.length; i++)
		{
			if (node.getSubtree(i) != null)
			{
				let points1 = points[node.getSubtree(i).getPoints()[0]];
				console.log("SMALLEST Punto 1:", points1);
				let points2 = points[node.getSubtree(i).getPoints()[1]];
				console.log("SMALLEST Punto 2:", points2);	
				let points3 = points[node.getSubtree(i).getPoints()[2]];
				console.log("SMALLEST Punto 3:", points3);
				let triangle = [points1, points2, points3]
				let type = classifyPoint(p, triangle);
				if (type == 2)
				{
					return find_smallest(node.getSubtree(i), p, points);
				}
			}
		}
	}
}


function colineal(node, p, points) {
    let p1 = points[node.getPoints()[0]];
    console.log("COLINEAL Punto 1:", p1);
    let p2 = points[node.getPoints()[1]];
    console.log("COLINEAL Punto 2:", p2);
    let p3 = points[node.getPoints()[2]];
    console.log("COLINEAL Punto 3:", p3);

    if (isColinear(p1, p2, p)) {
		console.log("Puntos colineales:", p1, p2, p);
        return [node.getPoints()[0], node.getPoints()[1], node.getPoints()[2]];
    } else if (isColinear(p2, p3, p)) {
		console.log("Puntos colineales:", p2, p3, p);
        return [node.getPoints()[1], node.getPoints()[2], node.getPoints()[0]];
    } else if (isColinear(p3, p1, p)) {
		console.log("Puntos colineales:", p3, p1, p);
        return [node.getPoints()[2], node.getPoints()[0], node.getPoints()[1]];
    } else {
		console.error("No points are colinear");
        return null;
    }
}

function isColinear(p1, p2, p) {
    if (!p1 || !p2 || !p) {
        console.error("Invalid points provided to isColinear");
        return false;
    }
    let area = p1.x * (p2.y - p.y) + p2.x * (p.y - p1.y) + p.x * (p1.y - p2.y);
    return area === 0;
}


function triangulate(node, p, points)
{

	var triangle1 = null;
	var triangle2 = null;
	for (let i = 0; i < node.subtree.length; i++)
	{
		if (node.getSubtree(i) != null)
		{
			let points1 = points[node.getSubtree(i).getPoints()[0]];
			console.log("Punto 1:", points1);
			let points2 = points[node.getSubtree(i).getPoints()[1]];
			console.log("Punto 2:", points2);	
			let points3 = points[node.getSubtree(i).getPoints()[2]];
			console.log("Punto 3:", points3);
			if (!points1 || !points2 || !points3) {
                console.error("Invalid points in triangulate function");
                continue;
            }
			let type = classifyPoint(p, [points1, points2, points3] );
			if (type == 1)
			{
				return [node.getSubtree(i)];
			}
			else if (type == 2)
			{
				if (triangle1 == null)
					triangle1 = node.getSubtree(i);
				else
					triangle2 = node.getSubtree(i);
			}
		}

	}
	if (triangle1 != null && triangle2 != null)
	{
		return [triangle1, triangle2];
	}
	return null;

	
}


function classifyPoint(p, triangle) {
	// TODO Change this!
	const mat1 = math.matrix([[triangle[0].x, triangle[1].x, p.x], [triangle[0].y, triangle[1].y, p.y], [1, 1, 1]]);
    const mat2 = math.matrix([[triangle[1].x, triangle[2].x, p.x], [triangle[1].y, triangle[2].y, p.y], [1, 1, 1]]);
    const mat3 = math.matrix([[triangle[2].x, triangle[0].x, p.x], [triangle[2].y, triangle[0].y, p.y], [1, 1, 1]]);

    const d1 = math.det(mat1);
    const d2 = math.det(mat2);
    const d3 = math.det(mat3);

    return orentation_test(d1, d2, d3, triangle);

}

function orentation_test(d1, d2, d3)
{
	if ((d1 > 0 && d2 > 0 && d3 > 0) || (d1 < 0 && d2 < 0 && d3 < 0))
		return 1; // punto dentro del triangulo
	else if ((d1 == 0 && d2 > 0 && d3 > 0) || (d1 == 0 && d2 < 0 && d3 < 0))
	{
		return 2;
	}  
	else if ((d2 == 0 && d1 > 0 && d3 > 0) || (d2 == 0 && d1 < 0 && d3 < 0))
	{
		return 2;
	}
	else if ((d3 == 0 && d1 > 0 && d2 > 0) || (d3 == 0 && d1 < 0 && d2 < 0))
	{
		return 2; // esta en segmento
	}
  	else if (d1 == 0 && d2 == 0 || d1 == 0 && d3 == 0 || d2 == 0 && d3 == 0)
    	return 3; // coincide con un vertice
	else
		return 4; // esta fuera del triangulo

}



function Triangles(root) {
    let output = new Array();
    if (!root.haveSubtree()) {
        output.push(root.getPoints());
    } else {
        for (let i = 0; i < root.subtree.length; i++) {
            let child = root.getSubtree(i);
            if (child != null) {
                output = output.concat(Triangles(child));
            }
        }
    }
    return output;
}