#version 450

out vec4 FragColour;

in vec3 _WorldPos;
in vec3 _Colour;
in vec3 _Normal;
in vec2 _TexCoords;
in vec4 _FragPosLightSpace;

// Samplers
uniform sampler2D albedoMap;

void main()
{
	// Normalize all direction vectors
	vec4 colourOut = texture(albedoMap, _TexCoords);
	FragColour = colourOut;	
}