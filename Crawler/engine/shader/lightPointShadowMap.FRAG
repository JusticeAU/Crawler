#version 330
in vec3 _WorldPos;
in vec2 _TexCoords;

uniform vec3 cameraPosition;

uniform bool useAlphaCutoff;
uniform sampler2D albedoMap;
uniform sampler2D perlinNoise;

uniform float dissolveThreshold = 1.0;
//uniform float far_plane;

void main()
{
	if(useAlphaCutoff)
	{
		if(texture(albedoMap, _TexCoords).a < 0.5)
		{
			discard;
		}
	}
	
	// Get Dissolve Amount
	float dissolveValue = texture(perlinNoise, _TexCoords).r;
	if (dissolveValue > dissolveThreshold) discard;
	
    vec3 LightToVertex = _WorldPos - cameraPosition;
    float LightToPixelDistance = length(LightToVertex);
    gl_FragDepth = LightToPixelDistance / 15.0;
} 