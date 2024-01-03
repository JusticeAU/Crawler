#version 330

layout(points) in;
layout(points) out;
layout(max_vertices = 1) out;

in vec3 Position0[];
in vec3 Velocity0[];

out vec3 Position1;
out vec3 Velocity1;

uniform float gTime;
uniform float gDeltaTimeMillis;
uniform sampler1D gRandomTexture;
uniform vec3 gBoundsMin;
uniform vec3 gBoundsMax;

uniform vec3 gWindDirection = vec3(-5, 0, 0);
uniform float gRandomVelocityScale = 1.0f;
uniform float gRandomVelocityFrequency = 5.0f;

uniform float gMaxParticleVelocity = 1.0f;

vec3 GetRandomDir(float TexCoord)
{
    vec3 Dir = texture(gRandomTexture, TexCoord).xyz;
    Dir -= vec3(0.5, 0.5, 0.5);
    return normalize(Dir);
} 

void main()
{
	Velocity1 = Velocity0[0];
	vec3 pos = Position0[0];

	vec3 Dir = GetRandomDir((gTime * gRandomVelocityFrequency) + ((1.0 + gl_PrimitiveIDIn) / 1000.0)) * gRandomVelocityScale;
	Velocity1 = Velocity1 + (Dir * gDeltaTimeMillis);
	Velocity1 = Velocity1 + (gWindDirection * (gDeltaTimeMillis));
	
	if(length(Velocity1) > gMaxParticleVelocity) Velocity1 = Velocity1 - (Velocity1 * (gDeltaTimeMillis));
	pos += Velocity1 * (gDeltaTimeMillis / 10);
	
	if(pos.x < gBoundsMin.x) pos.x += -gBoundsMin.x + gBoundsMax.x;
	if(pos.y < gBoundsMin.y) pos.y += -gBoundsMin.y + gBoundsMax.y;
	if(pos.z < gBoundsMin.z) pos.z += -gBoundsMin.z + gBoundsMax.z;
							 
	if(pos.x > gBoundsMax.x) pos.x -= -gBoundsMin.x + gBoundsMax.x;
	if(pos.y > gBoundsMax.y) pos.y -= -gBoundsMin.y + gBoundsMax.y;
	if(pos.z > gBoundsMax.z) pos.z -= -gBoundsMin.z + gBoundsMax.z;
	
	Position1 = pos;
	EmitVertex();
	EndPrimitive();
} 