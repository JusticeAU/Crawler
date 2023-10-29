#version 450

in vec2 _TexCoords;
out vec4 FragColour;

uniform sampler2D frame;
uniform sampler2D Bloom;

void main()
{
	vec3 col = texture(frame, _TexCoords).rgb;
	col += texture(Bloom, _TexCoords).rgb;
    FragColour = vec4(col, 1.0);
}  