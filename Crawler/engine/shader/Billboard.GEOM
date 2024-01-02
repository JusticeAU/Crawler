#version 330

layout (points) in;
layout (triangle_strip) out;
layout (max_vertices = 4) out;

uniform mat4 gModel;
uniform mat4 gVP;
uniform vec3 gCameraPos;

uniform float quadScale = 1.0f;

out vec2 TexCoord;

void main()
{
    vec3 Pos = (gModel * vec4(gl_in[0].gl_Position.xyz, 1)).xyz;
	vec3 toCamera = normalize(gCameraPos - Pos);
    const vec3 up = vec3(0.0, 0.0, 1.0);
    vec3 right = normalize(cross(toCamera, up)); // up is not (rarely) perpendicular to toCamera, so the output wouldnt be normalised.
	vec3 actualUp = cross(right, toCamera);
	
	right *= quadScale;
	actualUp *= quadScale;
	
	Pos -= (right * 0.5);
	Pos -= (actualUp * 0.5);
    gl_Position = gVP * vec4(Pos, 1.0);
    TexCoord = vec2(0.0, 0.0);
    EmitVertex();

    Pos += actualUp;
    gl_Position = gVP * vec4(Pos, 1.0);
    TexCoord = vec2(0.0, 1.0);
    EmitVertex();

    Pos -= actualUp;
    Pos += right;
    gl_Position = gVP * vec4(Pos, 1.0);
    TexCoord = vec2(1.0, 0.0);
    EmitVertex();

    Pos += actualUp;
    gl_Position = gVP * vec4(Pos, 1.0);
    TexCoord = vec2(1.0, 1.0);
    EmitVertex();

    EndPrimitive();
}