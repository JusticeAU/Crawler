#version 330
layout (location = 0) in vec3 Position;
layout (location = 3) in vec2 TexCoords;

uniform mat4 pvmMatrix;
uniform mat4 mMatrix;

out vec3 _WorldPos;
out vec2 _TexCoords;

void main()
{
    vec4 Pos4 = vec4(Position, 1.0);
    gl_Position = pvmMatrix * Pos4;
    _WorldPos = (mMatrix * Pos4).xyz;
	_TexCoords = TexCoords;
} 