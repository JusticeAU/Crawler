#version 330
layout (location = 0) in vec3 Position;

uniform mat4 pvmMatrix;
uniform mat4 mMatrix;

out vec3 WorldPos;

void main()
{
    vec4 Pos4 = vec4(Position, 1.0);
    gl_Position = pvmMatrix * Pos4;
    WorldPos = (mMatrix * Pos4).xyz;
} 