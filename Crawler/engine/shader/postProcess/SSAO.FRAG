//https://learnopengl.com/Advanced-OpenGL/Framebuffers
#version 450

in vec2 _TexCoords;
out vec4 FragColour;

uniform sampler2D frame;
uniform sampler2D SSAO;

void main()
{
	vec3 col = texture(frame, _TexCoords).rgb;
	col *= texture(SSAO, _TexCoords).r;
    FragColour = vec4(col, 1.0);
}  