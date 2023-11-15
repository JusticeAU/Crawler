#version 450

layout (location = 0) out vec4 FragColour;
layout (location = 1) out vec4 Emission;

in vec3 _WorldPos;
in vec3 _Colour;
in vec3 _Normal;
in vec2 _TexCoords;
in vec4 _FragPosLightSpace;

// Samplers
uniform sampler2D albedoMap;
uniform vec3 cameraPosition;

uniform float emissiveScale = 1.0;

void main()
{
	FragColour = vec4(1, 1, 1, .9);
	Emission = vec4(1, 0, 0, 1) * emissiveScale;

}