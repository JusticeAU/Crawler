#version 450
layout (location = 0) in vec3 Position;
layout (location = 1) in vec3 Colour;

uniform mat4 pvMatrix;

out vec3 _Colour;

void main()
{
	_Colour = Colour;
	gl_Position = pvMatrix * vec4(Position, 1);
}