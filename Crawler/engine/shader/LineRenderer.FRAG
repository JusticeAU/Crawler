#version 450
out vec4 FragColor;

in vec3 _Colour;

void main()
{
	FragColor = vec4(_Colour, 1);
}