#version 330

layout(points) in;
layout(points) out;
layout(max_vertices = 100) out;

in vec3 Position0[];
in float Type0[];
in vec3 Velocity0[];
in float Age0[];
in float TTL0[];

out vec3 Position1;
out float Type1;
out vec3 Velocity1;
out float Age1;
out float TTL1;

uniform float gEmitTime = 0.1;
//uniform float gParticleTTL = 1.2;
uniform float gParticleTTLMin = 1.0;
uniform float gParticleTTLMax = 2.0;

uniform sampler1D gRandomTexture;

uniform vec3 gConvergencePoint = vec3(0,0,1);
uniform float gConvergenceStrength = 1.0f;

uniform float gTime;
uniform float gDeltaTimeMillis;

uniform vec3 gWindDirection = vec3(-5, 0, 0);
//uniform float gRandomVelocityScale = 1.0f;
//uniform float gRandomVelocityFrequency = 5.0f;

//uniform float gMaxParticleVelocity = 1.0f;

vec3 GetRandomDir(float TexCoord)
{
    vec3 Dir = texture(gRandomTexture, TexCoord).xyz;
    Dir -= vec3(0.5, 0.5, 0.5);
    return normalize(Dir);
} 

float GetRandomNum(float TexCoord)
{
    return texture(gRandomTexture, TexCoord).x;
} 



void main()
{
	float age = Age0[0] + gDeltaTimeMillis;
	
	if(Type0[0] == 0.0)
	{
				// Recreate the Emitter
		Position1 = Position0[0] ;
		Type1 = Type0[0];
		if(age / gEmitTime > 1.0)
		{
			Age1 = age - (gEmitTime * ( age / gEmitTime));
		}
		else
		{
			Age1 = age;
		}
		TTL1 = 0;
		Velocity1 = vec3(0,0,0.0);
		EmitVertex();
		EndPrimitive();
	
		while(age > gEmitTime) // emit overdue particles
		{
			// Emit a particle
			Position1 = Position0[0];
			Type1 = 1.0;
			Age1 = age - gEmitTime;
			TTL1 = mix(GetRandomNum(gTime + age), gParticleTTLMin, gParticleTTLMax);
			Velocity1 = GetRandomDir(gTime + (age * TTL1));
			EmitVertex();
			EndPrimitive();
			
			// Lower our age
			age -= gEmitTime;
			
		}
	}
	else if(Type0[0] == 1.0 && age < TTL0[0])
	{
		Position1 = Position0[0] + (Velocity0[0] * gDeltaTimeMillis);
		Type1 = 1.0;
		Age1 = age;
		TTL1 = TTL0[0];
		Velocity1 = Velocity0[0] + (gWindDirection * gDeltaTimeMillis);
		vec3 toConvergencePoint = normalize(gConvergencePoint - Position1);
		Velocity1 += toConvergencePoint * gConvergenceStrength * gDeltaTimeMillis;
		
		EmitVertex();
		EndPrimitive();
	}
} 