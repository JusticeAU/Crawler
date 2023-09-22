#version 450

in vec2 _TexCoords;
out vec4 FragColour;

uniform sampler2D frame;
uniform vec3 fadeColour;
uniform float fadeAmount;

void main()
{
	vec4 dest = vec4(texture(frame, _TexCoords).rgb, 1);
	vec4 source = vec4(fadeColour, 1);
    FragColour = (source * fadeAmount) + (dest * (1 - fadeAmount));
}  