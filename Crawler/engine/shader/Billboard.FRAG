#version 330
layout (location = 0) out vec4 FragColour;
layout (location = 1) out vec4 Emission;


uniform sampler2D gColorMap;

in vec2 TexCoord;

void main()
{
    FragColour = texture2D(gColorMap, TexCoord);
	//FragColour = vec4(1.0);
    if (FragColour.r == 0 && FragColour.g == 0 && FragColour.b == 0) {
        discard;
    }
}