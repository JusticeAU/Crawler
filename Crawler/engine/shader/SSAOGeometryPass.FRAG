#version 330 core
layout (location = 0) out vec3 gPosition;
layout (location = 1) out vec3 gNormal;
//layout (location = 2) out vec4 gAlbedoSpec;

in vec2 _TexCoords;
in vec3 _FragPos;
in vec3 _Normal;

void main()
{    
    // store the fragment position vector in the first gbuffer texture
    gPosition = _FragPos;
    // also store the per-fragment normals into the gbuffer
    gNormal = normalize(_Normal);
    // and the diffuse per-fragment color, ignore specular
    //gAlbedoSpec.rgb = vec3(0.95);
}  