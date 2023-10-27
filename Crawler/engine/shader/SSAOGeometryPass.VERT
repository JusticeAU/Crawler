#version 330 core

const int MAX_BONES = 100;

layout (location = 0) in vec3 Position;

layout (location = 2) in vec3 Normal;
layout (location = 3) in vec2 texCoords;

layout (location = 5) in ivec4 boneIDs;
layout (location = 6) in vec4 boneWeights;
layout (std140) uniform boneTransformBuffer
{
    mat4x4[MAX_BONES] bones;
};
// std vertex
uniform mat4 pvmMatrix;
uniform mat4 mMatrix;

// gbuffer specific - I can get rid of this eventually
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec2 _TexCoords;
out vec3 _FragPos;
out vec3 _Normal;

void main()
{
	vec4 viewPos;
	vec4 posTransformed = vec4(Position, 1);
	if(boneIDs[0] != -1) // This vert shader handles both skinned and non-skinned meshes. All skinned meshes in Crawler are animated and will have a boneTransform submitted.
	{
		mat4 boneTransform = bones[boneIDs[0]] * boneWeights[0];
			boneTransform += bones[boneIDs[1]] * boneWeights[1];
			boneTransform += bones[boneIDs[2]] * boneWeights[2];
			boneTransform += bones[boneIDs[3]] * boneWeights[3];
			
		posTransformed = boneTransform * vec4(Position, 1);
		viewPos = view * model * posTransformed;
	}
	else
		viewPos = view * model * vec4(Position,1);

    _FragPos = viewPos.xyz; 
    _TexCoords = texCoords;
    
    mat3 normalMatrix = transpose(inverse(mat3(view * model)));
    _Normal = normalMatrix * Normal;
    
    gl_Position = pvmMatrix * posTransformed;
}