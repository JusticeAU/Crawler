#version 330
in vec3 _WorldPos;
in vec2 _TexCoords;

uniform vec3 cameraPosition;

uniform bool useAlphaCutoff;

uniform sampler2D albedoMap;
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
    vec3 LightToVertex = _WorldPos - cameraPosition;
    float LightToPixelDistance = length(LightToVertex);
    gl_FragDepth = LightToPixelDistance / 15.0;
} 