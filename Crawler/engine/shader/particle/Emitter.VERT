#version 330

layout (location = 0) in vec3 Position;
layout (location = 1) in float Type;
layout (location = 2) in vec3 Velocity;
layout (location = 3) in float Age;
layout (location = 4) in float TTL;


out vec3 Position0;
out float Type0;
out vec3 Velocity0;
out float Age0;
out float TTL0;

void main()
{
    Position0 = Position;
	Type0 = Type;
    Velocity0 = Velocity;
	Age0 = Age;
	TTL0 = TTL;
} 