#version 450

out vec4 FragColour;

in vec2 _TexCoords;
in vec3 _WorldPos;
in vec3 _Normal;
in vec3 _Tangent;
in vec3 _BiTangent;


uniform vec3 cameraPosition;

uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D metallicMap;
uniform sampler2D roughnessMap;
uniform sampler2D aoMap;
uniform sampler2D emissiveMap;

uniform samplerCubeShadow shadowMap0;
uniform samplerCubeShadow shadowMap1;
uniform samplerCubeShadow shadowMap2;
uniform samplerCubeShadow shadowMap3;
uniform samplerCubeShadow shadowMap4;
uniform samplerCubeShadow shadowMap5;
uniform samplerCubeShadow shadowMap6;
uniform samplerCubeShadow shadowMap7;


// lights
const int MAX_POINTLIGHTS = 50;
const int MAX_AFFECTINGPOINTLIGHTS = 8;
uniform int numLights;
//uniform vec3 PointLightPositions[MAX_POINTLIGHTS];
//uniform vec3 PointLightColours[MAX_POINTLIGHTS];
//uniform ivec4 PointLightIndices;
layout (std140) uniform pointLightPositionBuffer
{
    vec4[MAX_POINTLIGHTS] PointLightPositions; // these are vec3s, treat them as such.
};
layout (std140) uniform pointLightColourBuffer
{
    vec4[MAX_POINTLIGHTS] PointLightColours; // these are vec3s, treat them as such.
};
uniform pointLightIndicesBuffer
{
    int[MAX_AFFECTINGPOINTLIGHTS] PointLightIndices;
};


const float PI = 3.14159265359;

vec3 GetNormalFromNormalMap(vec3 T, vec3 B, vec3 N);

// Lighting functions
float DistributionGGX(vec3 N, vec3 H, float roughness);
float GeometrySchlickGGX(float NdotV, float roughness);
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness);
vec3 fresnelSchlick(float cosTheta, vec3 F0);

// Shadow Configuration
const float EPSILON = 0.003f;
const int samples = 20;
const vec3 sampleOffsetDirections[20] = vec3[]
(
   vec3( 1,  1,  1), vec3( 1, -1,  1), vec3(-1, -1,  1), vec3(-1,  1,  1), 
   vec3( 1,  1, -1), vec3( 1, -1, -1), vec3(-1, -1, -1), vec3(-1,  1, -1),
   vec3( 1,  1,  0), vec3( 1, -1,  0), vec3(-1, -1,  0), vec3(-1,  1,  0),
   vec3( 1,  0,  1), vec3(-1,  0,  1), vec3( 1,  0, -1), vec3(-1,  0, -1),
   vec3( 0,  1,  1), vec3( 0, -1,  1), vec3( 0, -1, -1), vec3( 0,  1, -1)
); 

void main()
{
	// Sample and set values from texture maps;
	vec3 albedo     = pow(texture(albedoMap, _TexCoords).rgb, vec3(2.2));
    vec3 normal     = GetNormalFromNormalMap(_Tangent, _BiTangent, _Normal);
    float metallic  = texture(metallicMap, _TexCoords).r;
    float roughness = texture(roughnessMap, _TexCoords).r;
    float ao        = texture(aoMap, _TexCoords).r;
	vec3 emissive	= texture(emissiveMap, _TexCoords).rgb;
	
	vec3 N = normalize(normal); 
	vec3 V = normalize(cameraPosition - _WorldPos);

	vec3 F0 = vec3(0.04); 
	F0      = mix(F0, albedo, metallic);
	
	// reflectance equation
	vec3 Lo = vec3(0.0);

	int lightsToRender = clamp(numLights, 0, MAX_AFFECTINGPOINTLIGHTS);
	for(int i = 0; i < lightsToRender; ++i) 
	{
		// calculate per-light radiance
		vec3 LightDirection = PointLightPositions[PointLightIndices[i]].xyz - _WorldPos;
		vec3 L = normalize(LightDirection);
		float Distance = (length(LightDirection) / 15.0) - EPSILON;
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
					
		vec3 H = normalize(V + L);
		float distance    = length(PointLightPositions[PointLightIndices[i]].xyz - _WorldPos);
		float attenuation = 1.0 / (distance * distance);
		vec3 radiance     = PointLightColours[PointLightIndices[i]].xyz * attenuation; 
		
		// calculate Cook-Torrance BRDF:
		float NDF = DistributionGGX(N, H, roughness);       
		float G   = GeometrySmith(N, V, L, roughness);  
		vec3 F  = fresnelSchlick(max(dot(H, V), 0.0), F0);
		
		vec3 kS = F;
		vec3 kD = vec3(1.0) - kS;
		kD *= 1.0 - metallic;
		
		vec3 numerator    = NDF * G * F;
		float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0)  + 0.0001;
		vec3 specular     = numerator / denominator;

		// add to outgoing radiance Lo
		float NdotL = max(dot(N, L), 0.0);        
		Lo += ((kD * albedo / PI + specular) * radiance * NdotL) * ShadowFactor;
	}
	
	vec3 ambient = vec3(0.03) * albedo * ao;
	vec3 color   = ambient + Lo + emissive;
	
	// Gamma correct - Reinhard.
	color = color / (color + vec3(1.0));
	color = pow(color, vec3(1.0/2.2));
	
	FragColour = vec4(color, 1.0);
}

vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a      = roughness*roughness;
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;
	
    float num   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
	
    return num / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float num   = NdotV;
    float denom = NdotV * (1.0 - k) + k;
	
    return num / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2  = GeometrySchlickGGX(NdotV, roughness);
    float ggx1  = GeometrySchlickGGX(NdotL, roughness);
	
    return ggx1 * ggx2;
}

vec3 GetNormalFromNormalMap(vec3 T, vec3 B, vec3 N)
{
	vec3 texNormal = texture(normalMap, _TexCoords ).rgb;
	mat3 TBN = mat3(T,B,N);
	return TBN * (texNormal * 2 - 1);
}