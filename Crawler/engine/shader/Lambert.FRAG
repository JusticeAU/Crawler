#version 450

out vec4 FragColour;

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
		vec3 LightDirection = PointLightPositions[PointLightIndices[i/4][i%4]].xyz - _WorldPos; // get direction from pixel to light (not normalized)
		vec3 L = normalize(LightDirection);
		float bias = max(0.06 * (1.0 - dot(N, L)), 0.005); // Scaling bias based on dot of normal to light.
		float Distance = (length(LightDirection) / 15.0) - bias;
		float offset  = 0.003;

		float ShadowFactor = 0.0;
		if(i == 0) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap0, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(i == 1) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap1, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(i == 2) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap2, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(i == 3) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap3, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(i == 4) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap4, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(i == 5) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap5, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(i == 6) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap6, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		else if(i == 7) for(int j = 0; j < samples; j++) ShadowFactor += texture(shadowMap7, vec4(-L + sampleOffsetDirections[j] * offset, Distance));
		
		
		ShadowFactor /= float(samples);
		
		// Attenuate the light intensity with inverese square law
		float distance = length(LightDirection);
		float attenuation = 1.0 / (distance * distance);
		LightDirection = LightDirection / distance; // normalize
		attenuation = min(attenuation, 0.02);
		diffuseTotal +=  (PointLightColours[PointLightIndices[i/4][i%4]].xyz * attenuation) * ShadowFactor;
	}
	
	//shadow = ShadowCalculation(_FragPosLightSpace);
	

	vec3 texColour = texture(diffuseTex, _TexCoords).rgb;
	vec3 lighting = diffuseTotal * texColour;  
	FragColour = vec4(lighting, 1);	
}