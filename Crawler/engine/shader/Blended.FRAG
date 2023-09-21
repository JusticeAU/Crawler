#version 450

out vec4 FragColour;

in vec3 _WorldPos;
in vec3 _Colour;
in vec3 _Normal;
in vec2 _TexCoords;
in vec4 _FragPosLightSpace;

// Samplers
uniform sampler2D albedoMap;
uniform vec3 cameraPosition;

void main()
{
	// Normalize all direction vectors
	vec4 colourOut = texture(albedoMap, _TexCoords);
	vec3 toCamera = normalize(cameraPosition - _WorldPos);
	float alphaFactor = abs(dot(_Normal, toCamera));
	FragColour = vec4(colourOut.xyz, colourOut.a * (alphaFactor));	
	//FragColour = vec4(_Normal, 1);
}