#version 330 core
layout (location = 0) out vec3 gPosition;
layout (location = 1) out vec3 gNormal;
//layout (location = 2) out vec4 gAlbedoSpec;

in vec2 _TexCoords;
in vec3 _FragPos;
in vec3 _Normal;

uniform bool useAlphaCutoff;
uniform sampler2D albedoMap;
uniform sampler2D perlinNoise;

uniform float dissolveThreshold = 1.0;

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
	
    // store the fragment position vector in the first gbuffer texture
    gPosition = _FragPos;
    // also store the per-fragment normals into the gbuffer
    gNormal = normalize(_Normal);
    // and the diffuse per-fragment color, ignore specular
    //gAlbedoSpec.rgb = vec3(0.95);
}  