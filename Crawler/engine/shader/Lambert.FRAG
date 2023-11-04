#version 450
layout (location = 0) out vec4 FragColour;
layout (location = 1) out vec4 Emission;

in vec3 _WorldPos;
in vec3 _Colour;
in vec3 _Normal;
in vec2 _TexCoords;
in vec4 _FragPosLightSpace;

// Lights 
uniform vec3 ambientLightColour;
uniform vec3 sunLightDirection;
uniform vec3 sunLightColour;

// Point Lights
const int MAX_POINTLIGHTS = 50;
const int MAX_AFFECTINGPOINTLIGHTS = 8;
uniform int numLights;
//uniform vec3 PointLightColours[MAX_POINTLIGHTS];
//uniform vec3 PointLightPositions[MAX_POINTLIGHTS];
layout (std140) uniform pointLightPositionBuffer
{
    vec4[MAX_POINTLIGHTS] PointLightPositions;
};
layout (std140) uniform pointLightColourBuffer
{
    vec4[MAX_POINTLIGHTS] PointLightColours;
};
uniform pointLightIndicesBuffer
{
	ivec4[2] PointLightIndices; // this is an ivec4 to ensure integer packing.
	// index in to it like this, [i/4][i%4]
};


// Samplers
uniform sampler2D diffuseTex;
uniform sampler2D shadowMap;

uniform samplerCubeShadow shadowMap0;
uniform samplerCubeShadow shadowMap1;
uniform samplerCubeShadow shadowMap2;
uniform samplerCubeShadow shadowMap3;
uniform samplerCubeShadow shadowMap4;
uniform samplerCubeShadow shadowMap5;
uniform samplerCubeShadow shadowMap6;
uniform samplerCubeShadow shadowMap7;
uniform samplerCubeShadow shadowMap8;
uniform samplerCubeShadow shadowMap9;
uniform samplerCubeShadow shadowMap10;
uniform samplerCubeShadow shadowMap11;
uniform samplerCubeShadow shadowMap12;
uniform samplerCubeShadow shadowMap13;
uniform samplerCubeShadow shadowMap14;
uniform samplerCubeShadow shadowMap15;
uniform samplerCubeShadow shadowMap16;
uniform samplerCubeShadow shadowMap17;
uniform samplerCubeShadow shadowMap18;
uniform samplerCubeShadow shadowMap19;

// Shadow Configuration
const int samples = 20;
const vec3 sampleOffsetDirections[20] = vec3[]
(
   vec3( 1,  1,  1), vec3( 1, -1,  1), vec3(-1, -1,  1), vec3(-1,  1,  1), 
   vec3( 1,  1, -1), vec3( 1, -1, -1), vec3(-1, -1, -1), vec3(-1,  1, -1),
   vec3( 1,  1,  0), vec3( 1, -1,  0), vec3(-1, -1,  0), vec3(-1,  1,  0),
   vec3( 1,  0,  1), vec3(-1,  0,  1), vec3( 1,  0, -1), vec3(-1,  0, -1),
   vec3( 0,  1,  1), vec3( 0, -1,  1), vec3( 0, -1, -1), vec3( 0,  1, -1)
); 

uniform float shadowBias; // Legacy from directional light/shadow maps

// Functions
vec3 GetDiffuse(vec3 direction, vec3 colour, vec3 normal)
{
	return colour * max(0.0, dot( normal, -direction ) );
}

float ShadowCalculation(vec4 fragPosLightSpace)
{
	// perform perspective divide
	vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
	projCoords = projCoords * 0.5 + 0.5;
	
	// if the shadow is outside of the orthographic far clip
	if(projCoords.z > 1.0) return 0.0;
        
	
	float closestDepth = texture(shadowMap, projCoords.xy).r;
	float currentDepth = projCoords.z;
	
	// if we get the direction in we can do this a bit more smartly with a dot product
	//float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);  
	float shadow = currentDepth - shadowBias > closestDepth  ? 1.0 : 0.0;
	
	// Simple PCF
	shadow = 0.0;
	vec2 texelSize = 1.0 / textureSize(shadowMap, 0);
	for(int x = -1; x <= 1; ++x)
	{
		for(int y = -1; y <= 1; ++y)
		{
			float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r; 
			shadow += currentDepth - shadowBias > pcfDepth ? 1.0 : 0.0;        
		}    
	}
	shadow /= 9.0;
	
	return shadow;
}

void main()
{
	// Normalize all direction vectors
	vec3 N = normalize(_Normal);
	vec3 SunLight = normalize(sunLightDirection);

	// calculate diffuse lighting from sunlight 
	vec3 diffuseTotal = GetDiffuse(SunLight, sunLightColour, N);
	
	// Calculate diffuse  for all point lights
	int lightsToRender = clamp(numLights, 0, MAX_AFFECTINGPOINTLIGHTS);
	for(int i = 0; i < lightsToRender; i++)
	{
		int lightIndex = PointLightIndices[i/4][i%4];
		
		vec3 LightDirection = PointLightPositions[lightIndex].xyz - _WorldPos; // get direction from pixel to light (not normalized)
		vec3 L = normalize(LightDirection);
		float bias = max(0.06 * (1.0 - dot(N, L)), 0.005); // Scaling bias based on dot of normal to light.
		float Distance = (length(LightDirection) / 15.0) - bias;
		float offset  = 0.003;

		float ShadowFactor = 0.0;
		if(		lightIndex == 0) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap0, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 1) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap1, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 2) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap2, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 3) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap3, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 4) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap4, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 5) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap5, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 6) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap6, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 7) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap7, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 8) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap8, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 9) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap9, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 10) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap10, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 11) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap11, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 12) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap12, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 13) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap13, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 14) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap14, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 15) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap15, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 16) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap16, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 17) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap17, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 18) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap18, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(lightIndex == 19) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap19, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		
		ShadowFactor /= float(samples);
		if(ShadowFactor < 0.001) continue;
		
		// Attenuate the light intensity with inverese square law
		float distance = length(LightDirection);
		float attenuation = 1.0 / (distance * distance);
		LightDirection = LightDirection / distance; // normalize
		attenuation = min(attenuation, 0.02);
		diffuseTotal +=  (PointLightColours[lightIndex].xyz * attenuation) * ShadowFactor;
	}
	
	//shadow = ShadowCalculation(_FragPosLightSpace);
	

	vec3 texColour = texture(diffuseTex, _TexCoords).rgb;
	vec3 lighting = diffuseTotal * texColour;  
	FragColour = vec4(lighting, 1);	
	Emission = vec4(0,0,0,0);
}