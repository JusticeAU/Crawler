#version 450

in vec2 _TexCoords;
out vec4 FragColour;

uniform sampler2D frame;

uniform vec3 fadeColour;
uniform float fadeAmount;

uniform sampler2D prompt;
uniform float promptAmount;
uniform bool promptUse;

void main()
{
	vec4 dest = vec4(texture(frame, _TexCoords).rgb, 1);
	vec4 source = vec4(fadeColour, 1);
	
	if(promptUse == true)
	{
		vec4 promptFrag = texture(prompt, _TexCoords);
		promptFrag *= promptAmount;
		FragColour = (source * fadeAmount) + (dest * (1 - fadeAmount)) + promptFrag;
	}
	else
	{
		FragColour = (source * fadeAmount) + (dest * (1 - fadeAmount));
	}

	
   
}  